# yChat Development Guide

Complete development and contribution guide.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Code Structure](#code-structure)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [Testing](#testing)

---

## Project Overview

### What is yChat?

**yChat** is a customizable Twitch chat overlay for streamers, based on ChatIS (fork of jChat). It displays chat messages in OBS with support for:
- **Twitch emotes** (including 7TV, BTTV, FFZ)
- **User badges** (Twitch, channel, 7TV, FFZ, BTTV, Chatterino)
- **Custom styling** (fonts, sizes, colors, shadows, strokes)
- **Advanced features** (TTS, animations, message fading, image overlay)
- **Platform support** (Twitch live, Kick planned)

### Technology Stack

**Frontend:**
- **HTML/CSS/JavaScript** (vanilla, no frameworks)
- **WebSocket** (Twitch IRC, 7TV EventAPI)
- **jQuery 3.6.0** (DOM manipulation)
- **DOMPurify 2.3.6** (XSS protection)

**APIs:**
- **Twitch Helix API** (badges, user data) via custom proxy
- **7TV API** (emotes, cosmetics, EventAPI)
- **BTTV API** (emotes, badges)
- **FFZ API** (emotes, badges)
- **StreamElements API** (TTS with Amazon Polly)

**Infrastructure:**
- **Cloudflare Pages** (static site hosting at chat.yaseen.zip)
- **Cloudflare Worker** (Twitch API proxy at api.yaseen.zip)
- **GitHub** (source control, version history)

### Project History

```
jChat (giambaJ) → ChatIS (IS2511) → yChat (yaseen)
```

**Key Changes in yChat:**
- ✅ Migrated to custom domain (chat.yaseen.zip)
- ✅ Self-hosted API proxy (api.yaseen.zip Cloudflare Worker)
- ✅ Badge reordering (Chatterino hierarchy)
- ✅ TTS via StreamElements public API
- ✅ Dynamic URLs (window.location.origin)
- ✅ Custom superadmin access (yaseen: 2000)
- 🔄 Modern UI redesign (planned)
- 🔄 Kick platform support (planned)

---

## Architecture

### High-Level Overview

```
┌─────────────────┐
│   OBS Studio    │
│  (Browser Src)  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│    Cloudflare Pages (chat.yaseen.zip)│
│    ┌──────────────────────────┐    │
│    │   index.html (setup UI)  │    │
│    │   v2/index.html (overlay)│    │
│    │   v2/script.js (logic)   │    │
│    └──────────────────────────┘    │
└─────────────────────────────────────┘
         │
         ├──► Twitch IRC WebSocket (chat messages)
         ├──► 7TV EventAPI WebSocket (emote updates)
         ├──► BTTV/FFZ API (emotes/badges)
         ├──► StreamElements API (TTS)
         │
         └──► Cloudflare Worker (api.yaseen.zip)
                     │
                     └──► Twitch Helix API (badges)
```

### Data Flow

**1. Initialization:**
```
User opens overlay URL in OBS
  → Parse URL parameters (channel, size, font, etc.)
  → Load CSS variants (font, size, stroke, shadow)
  → Connect to Twitch IRC WebSocket
  → Load emotes (7TV, BTTV, FFZ)
  → Load badges (Twitch, 7TV, BTTV, FFZ, Chatterino)
  → Connect to 7TV EventAPI
  → Ready to display chat
```

**2. Message Flow:**
```
Chat message sent on Twitch
  → Twitch IRC → WebSocket PRIVMSG
  → Parse IRC tags (badges, color, emotes)
  → Check access level (for commands)
  → Render username + badges
  → Parse message (replace emotes, mentions)
  → Sanitize with DOMPurify
  → Append to #chat_box
  → Animate (if enabled)
  → Schedule fade (if enabled)
```

**3. Emote Updates (7TV EventAPI):**
```
Emote added/removed on 7TV
  → EventAPI emote_set.update event
  → Update Chat.info.emotes
  → Re-render affected messages
```

### File Structure

```
/
├── index.html              # Setup page (URL generator)
├── jquery.min.js           # jQuery 3.6.0
├── purify.min.js           # DOMPurify 2.3.6
├── script.js               # Setup page logic
├── LICENSE                 # GPL-3.0
├── README.md               # Main documentation
├── SETUP.md                # Setup guide
├── DOCS.md                 # API reference
├── DEVELOPMENT.md          # This file
├── CHANGELOG.md            # Version history
│
├── styles/                 # CSS variants
│   ├── style.css           # Base styles
│   ├── font_*.css          # Font variants (12 fonts)
│   ├── size_*.css          # Size variants (small/medium/large)
│   ├── stroke_*.css        # Stroke variants (thin to thicker)
│   ├── shadow_*.css        # Shadow variants (small/medium/large)
│   ├── variant_*.css       # Display variants (hide names, small caps, etc.)
│
├── v2/                     # Overlay application
│   ├── index.html          # Overlay page
│   ├── script.js           # Main application logic (2697 lines)
│   ├── irc-message.js      # IRC message parser
│   ├── jchatBreak.js       # Line break utility
│   ├── jquery.min.js       # jQuery 3.6.0
│   ├── purify.min.js       # DOMPurify 2.3.6
│   ├── arrive.min.js       # DOM mutation observer
│   ├── twemoji.min.js      # Twitter emoji support
│   ├── tinycolor.js        # Color manipulation
│   ├── reconnecting-websocket.min.js  # Auto-reconnect WebSocket
│   │
│   ├── badges/             # Badge images
│   │   ├── chatis-mod/     # ChatIS mod badge
│   │   ├── users/          # User-specific badges
│   │
│   ├── styles/             # Same as root /styles
│
├── worker-deploy.js        # Cloudflare Worker template (API proxy)
├── .gitignore              # Git ignore rules
```

### Key Components

**v2/script.js** (Main Application):
```javascript
// Global state
const Chat = {
    info: {},               // Channel/user data
    stv: { eventApi: {} },  // 7TV integration
    write: function() {},   // Message writer
    reloadEmotes: function() {}  // Emote reloader
};

// Entry point
document.addEventListener('DOMContentLoaded', () => {
    parseURLParams();
    loadCSSVariants();
    connectToTwitchIRC();
    loadEmotes();
    loadBadges();
    connect7TVAPI();
});
```

**worker-deploy.js** (API Proxy):
```javascript
// Cloudflare Worker
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Check Referer for security
    // Parse path and params
    // Proxy to Twitch API with Client-ID + Bearer token
    // Return response with CORS headers
}
```

---

## Development Setup

### Prerequisites

- **Node.js** (optional, for local server)
- **Python 3** (alternative for local server)
- **Git** (version control)
- **Code editor** (VS Code recommended)

### Local Development

**Option 1: Python HTTP Server**

```powershell
# Navigate to project directory
cd C:\Users\yaseen\Desktop\Chatty

# Start server on port 3000
python -m http.server 3000

# Open in browser
start http://localhost:3000/v2/?channel=xqc
```

**Option 2: Node.js HTTP Server**

```powershell
# Install http-server globally
npm install -g http-server

# Start server
http-server -p 3000

# Open in browser
start http://localhost:3000/v2/?channel=xqc
```

**Option 3: VS Code Live Server**

1. Install **Live Server** extension
2. Right-click `v2/index.html`
3. Select **"Open with Live Server"**
4. Append `?channel=xqc` to URL

### Testing Changes

**1. Edit Code:**
```powershell
# Open in VS Code
code .

# Edit files (e.g., v2/script.js)
# Save changes (Ctrl+S)
```

**2. Test Locally:**
```powershell
# Reload browser (Ctrl+R)
# Check browser console (F12)
# Look for errors or logs
```

**3. Test in OBS:**
```
1. Add Browser Source
2. URL: http://localhost:3000/v2/?channel=xqc
3. Width: 1920, Height: 1080
4. Check "Shutdown when not visible"
5. Check "Refresh when active"
```

### Browser Console Tips

**Useful Console Commands:**

```javascript
// Reload emotes
Chat.reloadEmotes('Manual reload');

// Inspect state
console.log(Chat.info);

// Test message
Chat.write('testuser', {
    color: '#FF0000',
    badges: 'moderator/1',
    'display-name': 'TestUser'
}, 'Test message Kappa');

// Check 7TV connection
console.log(Chat.stv.eventApi.ws.readyState);
// 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
```

---

## Code Structure

### URL Parameter Parsing

**Location:** `v2/script.js` ~lines 50-150

```javascript
const urlParams = new URLSearchParams(window.location.search);

Chat.info.channel = urlParams.get('channel').toLowerCase();
Chat.info.size = parseInt(urlParams.get('size')) || 2;
Chat.info.font = parseInt(urlParams.get('font')) || 11;
Chat.info.animate = urlParams.get('animate') === 'true';
Chat.info.fade = parseInt(urlParams.get('fade')) || 0;
// ... etc
```

### CSS Variant Loading

**Location:** `v2/script.js` ~lines 160-200

```javascript
function loadCSS(variant, value) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${basePath}/styles/${variant}_${value}.css`;
    document.head.appendChild(link);
}

loadCSS('font', fontName);
loadCSS('size', sizeName);
loadCSS('stroke', strokeName);
loadCSS('shadow', shadowName);
```

### IRC Connection

**Location:** `v2/script.js` ~lines 300-400

```javascript
const ws = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv:443');

ws.onopen = () => {
    ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    ws.send('PASS oauth:justinfan12345');
    ws.send('NICK justinfan12345');
    ws.send(`JOIN #${Chat.info.channel}`);
};

ws.onmessage = (event) => {
    const messages = parseIRCMessage(event.data);
    messages.forEach(handleIRCMessage);
};
```

### Message Rendering

**Location:** `v2/script.js` ~lines 800-1200

```javascript
Chat.write = function(nick, tags, message) {
    // Build message HTML
    const container = $('<div>').addClass('message');
    
    // Add badges
    const badgeHTML = renderBadges(tags.badges, nick);
    container.append(badgeHTML);
    
    // Add username
    const usernameHTML = renderUsername(nick, tags);
    container.append(usernameHTML);
    
    // Parse message (emotes, mentions)
    const messageHTML = parseMessage(message, tags);
    container.append(messageHTML);
    
    // Sanitize
    const clean = DOMPurify.sanitize(container.html());
    
    // Append to chat
    $('#chat_box').append(clean);
    
    // Animate if enabled
    if (Chat.info.animate) {
        container.addClass('slide-in');
    }
    
    // Schedule fade if enabled
    if (Chat.info.fade > 0) {
        setTimeout(() => container.fadeOut(), Chat.info.fade * 1000);
    }
};
```

### Emote Loading

**Location:** `v2/script.js` ~lines 1400-1700

```javascript
async function loadEmotes() {
    // 7TV
    const stvUser = await fetch(`https://7tv.io/v3/users/twitch/${Chat.info.channelId}`);
    const stvGlobal = await fetch('https://7tv.io/v3/emote-sets/global');
    
    // BTTV
    const bttvChannel = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${Chat.info.channelId}`);
    const bttvGlobal = await fetch('https://api.betterttv.net/3/cached/emotes/global');
    
    // FFZ
    const ffzChannel = await fetch(`https://api.frankerfacez.com/v1/room/id/${Chat.info.channelId}`);
    const ffzGlobal = await fetch('https://api.frankerfacez.com/v1/set/global');
    
    // Combine into Chat.info.emotes
}
```

### Badge Loading

**Location:** `v2/script.js` ~lines 1700-2000

```javascript
async function loadBadges() {
    // Twitch global badges
    const globalBadges = await twitchAPIproxy('/helix/chat/badges/global');
    
    // Twitch channel badges
    const channelBadges = await twitchAPIproxy(
        '/helix/chat/badges',
        `broadcaster_id=${Chat.info.channelId}`
    );
    
    // 7TV badges
    const stvCosmetics = await fetch('https://7tv.io/v3/cosmetics?user_identifier=twitch_id');
    
    // BTTV badges
    const bttvUsers = await fetch('https://api.betterttv.net/3/cached/badges');
    
    // FFZ badges
    const ffzUsers = await fetch('https://api.frankerfacez.com/v1/badges/ids');
    
    // Chatterino badges
    const chatterino = await fetch('https://api.chatterino.com/badges');
}
```

### 7TV EventAPI

**Location:** `v2/script.js` ~lines 2100-2400

```javascript
Chat.stv.eventApi.connect = function() {
    const ws = new WebSocket('wss://events.7tv.io/v3');
    
    ws.onmessage = (event) => {
        const { op, d, t } = JSON.parse(event.data);
        
        if (op === 1) { // HELLO
            // Start heartbeat
            setInterval(() => {
                ws.send(JSON.stringify({ op: 2, d: { count: 1 } }));
            }, d.heartbeat_interval);
            
            // Subscribe to emote set updates
            ws.send(JSON.stringify({
                op: 35, // SUBSCRIBE
                d: {
                    type: 'emote_set.*',
                    condition: { object_id: Chat.info.emoteSetId }
                }
            }));
        }
        
        if (t === 'emote_set.update') {
            // Handle emote add/remove/update
            handleEmoteUpdate(d);
        }
    };
};
```

### Command Handling

**Location:** `v2/script.js` ~lines 600-800

```javascript
function handleCommand(nick, tags, message) {
    if (!message.startsWith('!chatis')) return;
    
    const accessLevel = getUserAccessLevel(nick, tags);
    const [, command, ...args] = message.split(' ');
    
    switch (command) {
        case 'ping':
            if (accessLevel >= AccessLevel.MOD) {
                Chat.write('ChatIS', {}, 'Pong!');
            }
            break;
            
        case 'tts':
            if (accessLevel >= AccessLevel.MOD) {
                handleTTS(args.join(' '));
            }
            break;
            
        case 'img':
            if (accessLevel >= AccessLevel.BROADCASTER) {
                handleImageOverlay(args.join(' '));
            }
            break;
    }
}

function getUserAccessLevel(nick, tags) {
    // Hardcoded superadmins
    if (nick === 'yaseen') return 2000;
    if (nick === 'is2511') return 1000;
    
    // Broadcaster
    if (tags.badges && tags.badges.includes('broadcaster')) return 1000;
    
    // Moderator
    if (tags.mod === '1') return 500;
    
    // Regular user
    return 0;
}
```

---

## Contributing

### Contribution Workflow

1. **Fork Repository:**
   ```powershell
   git clone https://github.com/YaseenHQ/ChatIS.git
   cd ChatIS
   ```

2. **Create Branch:**
   ```powershell
   git checkout -b feature/my-feature
   ```

3. **Make Changes:**
   - Edit files
   - Test locally
   - Commit changes

4. **Push Changes:**
   ```powershell
   git add .
   git commit -m "Add: My feature description"
   git push origin feature/my-feature
   ```

5. **Create Pull Request:**
   - Visit GitHub repo
   - Click "New Pull Request"
   - Describe changes
   - Submit

### Coding Guidelines

**JavaScript Style:**
```javascript
// Use const/let (not var)
const channelName = 'xqc';
let messageCount = 0;

// Use template literals
const url = `https://api.example.com/${channelName}`;

// Use arrow functions
const parseMessage = (text) => DOMPurify.sanitize(text);

// Use async/await (not .then())
const data = await fetch(url).then(r => r.json());

// Add JSDoc comments
/**
 * Write a chat message to the overlay
 * @param {string} nick - Username
 * @param {object} tags - IRC tags
 * @param {string} message - Message text
 */
function write(nick, tags, message) {}
```

**CSS Style:**
```css
/* Use kebab-case for classes */
.chat-message { }

/* Use BEM naming when appropriate */
.chat-message__username { }
.chat-message--highlighted { }

/* Group related properties */
.element {
    /* Positioning */
    position: relative;
    top: 0;
    
    /* Display */
    display: flex;
    align-items: center;
    
    /* Colors */
    color: #fff;
    background: #000;
    
    /* Typography */
    font-size: 16px;
    font-weight: bold;
}
```

**Git Commit Style:**
```
Add: New feature or functionality
Fix: Bug fix
Update: Changes to existing functionality
Refactor: Code restructuring (no behavior change)
Docs: Documentation changes
Style: Code style changes (formatting, etc.)
Test: Test additions or changes
Chore: Build process, dependencies, etc.
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested in OBS
- [ ] No console errors

## Screenshots (if applicable)
![Screenshot](url)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented hard-to-understand areas
- [ ] Updated documentation
- [ ] No new warnings
```

---

## Deployment

### GitHub Repository

**Setup:**
```powershell
# Initialize repo
git init

# Add remote
git remote add origin https://github.com/YaseenHQ/ChatIS.git

# Configure user
git config user.name "yaseen"
git config user.email "hello@yaseen.in"

# Push to GitHub
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Cloudflare Pages

**Setup:**
1. Visit [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create Application**
3. Click **Pages** → **Connect to Git**
4. Select **GitHub** → **YaseenHQ/ChatIS**
5. Configure build:
   - **Project name**: chatis
   - **Production branch**: main
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
   - **Root directory**: `/`
6. Click **Save and Deploy**

**Custom Domain:**
1. Go to **Pages** → **chatis** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `chat.yaseen.zip`
4. Follow DNS setup instructions
5. Wait for SSL certificate provisioning

### Cloudflare Worker

**Deploy:**
```powershell
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create Worker
wrangler init ychat-api-proxy

# Copy worker-deploy.js to worker directory
# Edit wrangler.toml:
#   name = "ychat-api-proxy"
#   compatibility_date = "2024-01-01"

# Deploy
wrangler deploy

# Add environment variables (via dashboard)
# TWITCH_CLIENT_ID: <your_client_id>
# TWITCH_ACCESS_TOKEN: <your_access_token>
```

**Custom Domain:**
1. Go to **Workers** → **ychat-api-proxy** → **Settings** → **Domains & Routes**
2. Click **Add Custom Domain**
3. Enter: `api.yaseen.zip`
4. Click **Add Custom Domain**
5. Wait for DNS propagation

---

## Testing

### Manual Testing

**Browser Console:**
```javascript
// Test API proxy
fetch('https://api.yaseen.zip/?path=/helix/chat/badges/global')
    .then(r => r.json())
    .then(d => console.log(d));

// Test message rendering
Chat.write('testuser', {
    color: '#FF0000',
    badges: 'moderator/1',
    'display-name': 'TestUser'
}, 'Test Kappa PogChamp');

// Test emote loading
Chat.reloadEmotes('Manual test');

// Test 7TV connection
console.log(Chat.stv.eventApi.ws.readyState); // 1 = OPEN
```

**OBS Testing:**
1. Add Browser Source
2. URL: `http://localhost:3000/v2/?channel=xqc`
3. Send test messages in chat
4. Verify emotes, badges, colors
5. Test commands (`!chatis ping`, `!refreshoverlay`)

### Performance Testing

**Check FPS:**
```javascript
let frameCount = 0;
let lastTime = performance.now();

function countFrames() {
    frameCount++;
    const now = performance.now();
    
    if (now - lastTime >= 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = now;
    }
    
    requestAnimationFrame(countFrames);
}

countFrames();
```

**Check Memory:**
```javascript
// Chrome only
if (performance.memory) {
    setInterval(() => {
        const mb = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        console.log(`Memory: ${mb} MB`);
    }, 5000);
}
```

### Debugging

**Enable Verbose Logging:**

Edit `v2/script.js`, add at top:
```javascript
const DEBUG = true;

function log(...args) {
    if (DEBUG) console.log('[ChatIS]', ...args);
}

// Use throughout code:
log('Connecting to IRC...');
log('Loaded emotes:', Chat.info.emotes.size);
```

**Network Monitoring:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **WS** (WebSockets)
4. Check IRC and 7TV connections
5. Inspect message frames

**Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| No messages | IRC not connected | Check WebSocket state |
| Missing emotes | API error | Check Network tab, reload emotes |
| Badges not loading | API proxy error | Verify Worker env vars |
| High CPU | Too many messages | Enable fade, limit bots |
| Memory leak | Messages not removed | Enable fade parameter |

---

<p align="center">
  <strong>Happy Developing! 💻</strong>
</p>
