# yChat Setup Guide

Complete setup guide for streamers and content creators.

---

## 📋 Table of Contents

- [Quick Setup (5 Minutes)](#quick-setup-5-minutes)
- [OBS Configuration](#obs-configuration)
- [Customization Guide](#customization-guide)
- [API Proxy Setup (Self-Hosting)](#api-proxy-setup-self-hosting)
- [Troubleshooting](#troubleshooting)

---

## Quick Setup (5 Minutes)

### Step 1: Generate Your Overlay URL

1. Visit **[chat.yaseen.zip](https://chat.yaseen.zip)**
2. Enter your **Twitch channel name** (lowercase, no spaces)
3. Choose your preferred settings:
   - **Size**: Small (1), Medium (2), or Large (3)
   - **Font**: 12 built-in options or custom font
   - **Stroke**: Text outline thickness
   - **Shadow**: Drop shadow size
   - **Features**: Animations, fading, bot filtering, etc.

4. Click **"Generate URL"** button
5. **Copy** the generated URL from the result box

### Step 2: Add to OBS

1. In OBS, click **"+"** in Sources panel
2. Select **"Browser Source"**
3. Name it (e.g., "Chat Overlay")
4. **Paste** your generated URL into the **URL** field
5. Set dimensions:
   - **Width**: `1920` (or your canvas width)
   - **Height**: `1080` (or your canvas height)
6. **Check** these boxes:
   - ✅ "Shutdown source when not visible"
   - ✅ "Refresh browser when scene becomes active"
7. Click **OK**

✅ **Done!** Your chat overlay is live.

---

## OBS Configuration

### Recommended Settings

**Browser Source Properties:**
```
URL: https://chat.yaseen.zip/v2/?channel=YOURCHANNEL&[...params]
Width: 1920
Height: 1080
FPS: 30
Custom CSS: (leave empty)
```

**Checkboxes:**
- ✅ Shutdown source when not visible
- ✅ Refresh browser when scene becomes active
- ❌ Use custom frame rate (use default 30 FPS)
- ❌ Control audio via OBS (not needed)

### Performance Tips

**For better performance:**
- Use **Hardware Acceleration** in OBS settings
- Set Browser Source **FPS to 30** (not 60)
- Enable **"Shutdown when not visible"**
- Limit **fade duration** if using message fading

**For lower-end PCs:**
- Use **Small** size preset
- Disable **animations** (`animate=false`)
- Disable **message fading** (don't use `fade` param)
- Use **simple fonts** (Open Sans, Roboto, Segoe UI)

---

## Customization Guide

### Size & Font

**Size Presets:**
| Size | Value | Text Size | Best For |
|------|-------|-----------|----------|
| Small | `size=1` | 18px | 1080p+ canvas, compact look |
| Medium | `size=2` | 24px | Default, balanced |
| Large | `size=3` | 32px | Large displays, readability |

**Built-in Fonts:**
| Font ID | Font Name | Style |
|---------|-----------|-------|
| `font=1` | Baloo Tammudu | Rounded, playful |
| `font=2` | Segoe UI | Modern, clean |
| `font=3` | Roboto | Professional |
| `font=4` | Lato | Elegant |
| `font=5` | Noto Sans | Universal |
| `font=6` | Source Code Pro | Monospace |
| `font=7` | Impact | Bold, impactful |
| `font=8` | Comfortaa | Soft, rounded |
| `font=9` | Dancing Script | Handwritten |
| `font=10` | Indie Flower | Casual |
| `font=11` | Open Sans | ✨ **Default**, versatile |
| `font=12` | Alsina Ultrajada | Artistic |
| `font=0` | Custom | Use with `fontCustom=` |

**Custom Font Example:**
```
?channel=xqc&font=0&fontCustom=Comic%20Sans%20MS
```

### Stroke & Shadow

**Text Stroke (Outline):**
| Value | Thickness | CSS |
|-------|-----------|-----|
| `stroke=0` | None | No outline |
| `stroke=1` | Thin | 1px |
| `stroke=2` | Medium | 2px |
| `stroke=3` | Thick | 3px |
| `stroke=4` | Thicker | 4px |

**Text Shadow:**
| Value | Size | CSS |
|-------|------|-----|
| `shadow=0` | None | No shadow |
| `shadow=1` | Small | 1px blur |
| `shadow=2` | Medium | 3px blur |
| `shadow=3` | Large | 5px blur |

### Features

**Animations:**
```
animate=true    # Slide-in animation for new messages
```

**Message Fading:**
```
fade=30         # Remove messages after 30 seconds
fade=60         # Remove messages after 60 seconds
```

**Bot Filtering:**
```
bots=false                           # Hide bots (default)
bots=true                            # Show bots
botNames=nightbot,streamelements    # Custom bot list to hide
```

**Emote Scaling:**
```
emoteScale=1.0   # Default size
emoteScale=1.5   # 50% larger
emoteScale=2.0   # Double size
emoteScale=0.5   # Half size
```

**Display Options:**
```
small_caps=true           # Text in SMALL CAPS
nl_after_name=true        # Username on separate line
hide_names=true           # Hide all usernames
hide_special_badges=true  # Hide 7TV/BTTV/FFZ badges
show_homies=true          # Show Chatterino Homies badges
```

### Complete Example URLs

**Minimalist:**
```
https://chat.yaseen.zip/v2/?channel=xqc&size=2&font=11&shadow=1
```

**Animated with Fade:**
```
https://chat.yaseen.zip/v2/?channel=xqc&size=2&font=11&animate=true&fade=30&shadow=2
```

**Large, Bold Style:**
```
https://chat.yaseen.zip/v2/?channel=xqc&size=3&font=7&stroke=3&shadow=3&emoteScale=1.5
```

**Clean, No Bots:**
```
https://chat.yaseen.zip/v2/?channel=xqc&size=2&font=11&bots=false&hide_special_badges=true
```

---

## API Proxy Setup (Self-Hosting)

If you're self-hosting yChat, you need to set up a Twitch API proxy to avoid CORS issues.

### Option 1: Cloudflare Worker (Recommended)

1. **Create Cloudflare Worker:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** → **Create Application**
   - Click **Create Worker**
   - Name it (e.g., `ychat-api-proxy`)

2. **Deploy Worker Code:**
   - Copy the code from [`worker-deploy.js`](worker-deploy.js)
   - Paste into the Cloudflare Worker editor
   - Click **Save and Deploy**

3. **Add Environment Variables:**
   - Go to **Settings** → **Variables**
   - Add variable: `TWITCH_CLIENT_ID`
     - Value: Your Twitch application Client ID
   - Add variable: `TWITCH_ACCESS_TOKEN`
     - Value: User access token from [twitchtokengenerator.com](https://twitchtokengenerator.com)
   - **Important**: Click **Encrypt** for both variables
   - Click **Deploy** to apply changes

4. **Get Twitch Credentials:**

   **Client ID & Secret:**
   - Visit [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
   - Click **Register Your Application**
   - Name: `yChat API Proxy`
   - OAuth Redirect URLs: `http://localhost`
   - Category: `Chat Bot`
   - Click **Create**
   - Copy **Client ID** (save for step 3)

   **Access Token:**
   - Visit [twitchtokengenerator.com](https://twitchtokengenerator.com)
   - Paste your **Client ID** and **Client Secret**
   - Select scopes: (none needed for basic chat)
   - Click **Generate Token**
   - Copy **Access Token** (save for step 3)

5. **Update Overlay Code:**
   - Edit `v2/script.js` line ~52
   - Change:
     ```javascript
     const apiProxyBase = 'https://api.yaseen.zip';
     ```
   - To:
     ```javascript
     const apiProxyBase = 'https://YOUR-WORKER.workers.dev';
     ```

### Option 2: Node.js Server

Create `api-proxy.js`:

```javascript
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const TWITCH_CLIENT_ID = 'your_client_id_here';
const TWITCH_ACCESS_TOKEN = 'your_access_token_here';

app.get('/', async (req, res) => {
  const path = req.query.path || '';
  const params = req.query.params || '';
  
  const twitchUrl = `https://api.twitch.tv${path}${params ? '?' + params : ''}`;
  
  try {
    const response = await fetch(twitchUrl, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`
      }
    });
    
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send('Proxy error');
  }
});

app.listen(3001, () => console.log('API proxy on port 3001'));
```

Run:
```bash
npm install express node-fetch cors
node api-proxy.js
```

Update `v2/script.js`:
```javascript
const apiProxyBase = 'http://localhost:3001';
```

---

## Troubleshooting

### Chat Not Showing

**Check:**
1. ✅ Channel name is correct (lowercase, no spaces)
2. ✅ Browser source URL is correct
3. ✅ Browser source dimensions are set (1920x1080)
4. ✅ Channel is live or has recent chat activity

**Test in browser:**
- Open the overlay URL directly in Chrome/Firefox
- Check browser console (F12) for errors
- Look for WebSocket connection messages

### Emotes Not Loading

**7TV Emotes:**
- Check if channel has 7TV emotes enabled
- Visit `7tv.app/users/{channel}` to verify

**BTTV/FFZ Emotes:**
- Check if channel has BTTV/FFZ installed
- Some channels disable third-party emotes

**All Emotes:**
- Wait 5-10 seconds for initial load
- Use `!refreshoverlay` command in chat to reload

### Badges Not Showing

**Twitch Badges:**
- Requires API proxy to be configured
- Check Cloudflare Worker environment variables
- Verify Twitch Client ID and Access Token are valid

**Special Badges (7TV/BTTV/FFZ):**
- Check `hide_special_badges=false` in URL
- These load from third-party APIs (may be slower)

### Performance Issues

**High CPU usage:**
- Reduce FPS to 30 in Browser Source settings
- Disable animations (`animate=false`)
- Use smaller size preset (`size=1`)
- Enable "Shutdown when not visible"

**Memory leaks:**
- Enable message fading (`fade=30`)
- Limit bot messages (`bots=false`)
- Refresh browser source periodically

### Commands Not Working

**`!chatis` commands:**
- Only work for mods/broadcaster
- Overlay must be visible in OBS
- Check browser console for command logs

**`!refreshoverlay`:**
- Available to all mods
- Reloads emotes and badges
- Does not refresh the entire overlay

### Browser Source Issues

**OBS-specific:**
- Use **OBS 28+** for best compatibility
- Enable **Hardware Acceleration** in OBS settings
- Try **Run as Administrator** if sources won't load

**Streamlabs OBS:**
- Works the same as OBS Studio
- May need to disable "Hardware Acceleration" in some cases

**XSplit:**
- Use **Web Browser** source instead of Browser Source
- Same URL and dimensions as OBS

---

## Getting Help

**Found a bug?**
- Open an issue: [github.com/YaseenHQ/ChatIS/issues](https://github.com/YaseenHQ/ChatIS/issues)

**Need help?**
- Check existing issues first
- Join the discussion on GitHub
- Ask in Yaseen's Twitch chat: [twitch.tv/yaseen](https://twitch.tv/yaseen)

**Feature request?**
- Open an issue with `[Feature Request]` in the title
- Describe the use case and expected behavior

---

<p align="center">
  <strong>Happy Streaming! 🎮</strong>
</p>
