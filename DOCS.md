# yChat API Documentation

Complete API and function reference for developers.

---

## 📋 Table of Contents

- [Chat Object](#chat-object)
- [URL Parameters](#url-parameters)
- [Commands API](#commands-api)
- [Functions Reference](#functions-reference)
- [Events](#events)
- [7TV Integration](#7tv-integration)
- [IRC Protocol](#irc-protocol)

---

## Chat Object

The global `Chat` object contains all state and functionality.

### Chat.info

Channel and user information.

```javascript
Chat.info = {
    channel: string,              // Current Twitch channel
    channelId: string,            // Twitch channel ID
    channelLogin: string,         // Channel login name (lowercase)
    userId: string,               // User ID (for 7TV EventAPI)
    
    emotes: Map<string, object>,  // All loaded emotes
    badges: Map<string, object>,  // Twitch badges
    bttvBadges: Set<string>,      // BTTV badge holders
    ffzBadges: Set<string>,       // FFZ badge holders
    ffzApBadges: Map<string, object>, // FFZ:AP badges
    chatterinoBadges: Set<string>, // Chatterino badge holders
    
    twitchGlobalBadges: object,   // Twitch global badges
    twitchChannelBadges: object,  // Channel-specific badges
    
    chatisModBadge: string,       // ChatIS mod badge URL
    userBadgePaths: Map<string, string>, // Custom user badges
    
    // 7TV cosmetics
    paints: Map<string, object>,  // Username paints
    badges7tv: Map<string, object>, // 7TV badges
    
    // Settings
    hideCommandsAndBots: boolean,
    hideSpecialBadges: boolean,
    showHomies: boolean,
    ttsReadsChat: boolean
};
```

### Chat.stv

7TV integration state.

```javascript
Chat.stv = {
    eventApi: {
        ws: WebSocket,            // EventAPI WebSocket
        heartbeatInterval: number, // Heartbeat timer
        reconnectAttempts: number, // Reconnection count
        subscriptionId: string,   // Current subscription ID
        sessionId: string         // Session identifier
    },
    
    cache: {
        tts: Map<string, string>  // TTS audio cache
    }
};
```

---

## URL Parameters

All URL parameters parsed by the overlay.

### Required

| Parameter | Type | Description |
|-----------|------|-------------|
| `channel` | string | Twitch channel name (lowercase) |

### Styling

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | 1-3 | 2 | Text size preset |
| `font` | 0-12 | 11 | Font selection |
| `fontCustom` | string | - | Custom font name (font=0) |
| `stroke` | 0-4 | 0 | Text stroke thickness |
| `shadow` | 0-3 | 1 | Text shadow size |
| `emoteScale` | number | 1 | Emote size multiplier (0-3) |

### Features

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `animate` | boolean | false | Slide-in animations |
| `fade` | number | - | Fade timeout (seconds) |
| `bots` | boolean | false | Show bot messages |
| `small_caps` | boolean | false | Small caps transform |
| `nl_after_name` | boolean | false | Newline after username |
| `hide_names` | boolean | false | Hide usernames |
| `hide_special_badges` | boolean | false | Hide 7TV/BTTV/FFZ badges |
| `show_homies` | boolean | false | Show Chatterino Homies |
| `botNames` | string | - | Custom bot filter list |

### Platform (Coming Soon)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `kickChannel` | string | - | Kick channel name |
| `showPlatformBadge` | boolean | false | Show platform logo badge |

---

## Commands API

Chat commands available via `!chatis` prefix.

### Access Levels

```javascript
const AccessLevel = {
    USER: 0,
    MOD: 500,
    SPECIAL: 700,
    BROADCASTER: 1000,
    SUPERADMIN: 2000
};
```

### Command: ping

Test overlay responsiveness.

**Syntax:**
```
!chatis ping
```

**Access:** Moderator (500+)

**Response:** Pong message in chat

### Command: link

Display current overlay URL.

**Syntax:**
```
!chatis link
```

**Access:** Broadcaster (1000+)

**Response:** Full overlay URL with current parameters

### Command: tts

Text-to-speech using StreamElements API (Amazon Polly).

**Syntax:**
```
!chatis tts <text>
!chatis tts -s <voice> <text>
!chatis tts -s <voice> -v <volume> <text>
```

**Parameters:**
- `-s <voice>`: Voice name (default: Brian)
- `-v <0-1>`: Volume (default: 0.5)

**Available Voices:**
- Brian, Ivy, Justin, Kendra, Kimberly, Salli, Joey, Matthew (US English)
- Joanna, Amy, Emma (UK English)
- Nicole, Russell (Australian English)
- And many more Amazon Polly voices

**Access:** Moderator (500+)

**Example:**
```
!chatis tts Hello world
!chatis tts -s Joanna Welcome to the stream
!chatis tts -s Brian -v 0.8 This is a test
```

### Command: img

Display image overlay.

**Syntax:**
```
!chatis img <url> [options]
!chatis img clear
```

**Options:**
- `-x`: Preserve aspect ratio
- `-f`: Foreground (default: background)
- `-h <pixels>`: Height
- `-w <pixels>`: Width
- `-o <0-1>`: Opacity (default: 1)
- `-t <seconds>`: Duration (default: 3)

**Access:** Broadcaster (1000+)

**Example:**
```
!chatis img https://i.imgur.com/example.gif
!chatis img https://i.imgur.com/example.png -t 10 -o 0.5
!chatis img clear
```

### Command: refreshoverlay

Reload emotes and badges.

**Syntax:**
```
!refreshoverlay
```

**Access:** Moderator (500+)

**Effect:** Reloads all emote sets and badge data

---

## Functions Reference

### Chat.write(nick, tags, message)

Write a chat message to the overlay.

**Parameters:**
```typescript
function write(
    nick: string,           // Username
    tags: object,           // IRC tags object
    message: string         // Message text
): void
```

**Tags Object:**
```javascript
{
    color: string,          // Username color (#RRGGBB)
    badges: string,         // Badge string "badge1/1,badge2/1"
    emotes: string,         // Twitch emote positions
    'display-name': string, // Display name (may have caps)
    'user-id': string,      // Twitch user ID
    id: string,             // Message ID
    mod: '0' | '1',         // Moderator status
    subscriber: '0' | '1',  // Subscriber status
    turbo: '0' | '1',       // Turbo status
    'user-type': string     // User type
}
```

**Example:**
```javascript
Chat.write('exampleuser', {
    color: '#9147FF',
    badges: 'moderator/1,subscriber/12',
    'display-name': 'ExampleUser',
    'user-id': '12345678'
}, 'Hello world Kappa');
```

### Chat.reloadEmotes(reason)

Reload all emote sets.

**Parameters:**
```typescript
function reloadEmotes(reason?: string): void
```

**Effect:**
- Clears emote cache
- Reloads 7TV, BTTV, FFZ emotes
- Logs reason to console

**Example:**
```javascript
Chat.reloadEmotes('User command');
```

### Chat.stv.eventApi.connect()

Connect to 7TV EventAPI WebSocket.

**Effect:**
- Establishes WebSocket connection
- Subscribes to channel events
- Starts heartbeat interval

**Events Handled:**
- `emote_set.update`: Emote added/removed/renamed
- `cosmetic.*`: Paint/badge changes
- `entitlement.*`: User role changes

### twitchAPIproxy(path, params)

Proxy Twitch API requests.

**Parameters:**
```typescript
function twitchAPIproxy(
    path: string,           // API path (e.g., '/helix/chat/badges/global')
    params?: string         // Query parameters
): Promise<Response>
```

**Example:**
```javascript
const response = await twitchAPIproxy(
    '/helix/chat/badges',
    'broadcaster_id=12345678'
);
const data = await response.json();
```

---

## Events

### DOMContentLoaded

Initialization event.

**Effect:**
- Parses URL parameters
- Loads CSS variants
- Connects to Twitch IRC
- Loads emotes and badges
- Connects to 7TV EventAPI

### IRC Events

**PRIVMSG:**
```javascript
// User chat message
{
    command: 'PRIVMSG',
    tags: object,
    prefix: 'user!user@user.tmi.twitch.tv',
    params: ['#channel', 'message text']
}
```

**CLEARMSG:**
```javascript
// Single message deleted
{
    command: 'CLEARMSG',
    tags: { 'target-msg-id': 'message-id' },
    params: ['#channel']
}
```

**CLEARCHAT:**
```javascript
// User timeout/ban or /clear
{
    command: 'CLEARCHAT',
    tags: { 'target-user-id': 'user-id' },
    params: ['#channel', 'username']
}
```

**USERNOTICE:**
```javascript
// Subscription, raid, etc.
{
    command: 'USERNOTICE',
    tags: { 'msg-id': 'sub' | 'resub' | 'raid' | ... },
    params: ['#channel', 'message']
}
```

### 7TV EventAPI Events

**emote_set.update:**
```javascript
{
    type: 'emote_set.update',
    body: {
        id: 'emote_set_id',
        pushed: [/* added emotes */],
        pulled: [/* removed emotes */],
        updated: [/* modified emotes */]
    }
}
```

**cosmetic.create:**
```javascript
{
    type: 'cosmetic.create',
    body: {
        kind: 'PAINT' | 'BADGE',
        object: { /* cosmetic data */ }
    }
}
```

---

## 7TV Integration

### REST API Endpoints

**User Emotes:**
```
GET https://7tv.io/v3/users/twitch/{userId}
```

**Global Emotes:**
```
GET https://7tv.io/v3/emote-sets/global
```

**Emote Set:**
```
GET https://7tv.io/v3/emote-sets/{emoteSetId}
```

**Cosmetics:**
```
GET https://7tv.io/v3/cosmetics
```

### EventAPI Protocol

**Connection:**
```
wss://events.7tv.io/v3
```

**HELLO Message:**
```javascript
{
    op: 1, // HELLO
    d: {
        heartbeat_interval: 45000,
        session_id: "..."
    }
}
```

**SUBSCRIBE:**
```javascript
{
    op: 35, // SUBSCRIBE
    d: {
        type: "emote_set.*",
        condition: { object_id: "emote_set_id" }
    }
}
```

**HEARTBEAT:**
```javascript
{
    op: 2, // HEARTBEAT
    d: { count: 1 }
}
```

---

## IRC Protocol

### Connection

**WebSocket URL:**
```
wss://irc-ws.chat.twitch.tv:443
```

**Authentication:**
```
PASS oauth:justinfan12345
NICK justinfan12345
```

**Capabilities:**
```
CAP REQ :twitch.tv/tags twitch.tv/commands
```

**Join Channel:**
```
JOIN #channel
```

### Message Format

**PRIVMSG:**
```
@badge-info=;badges=moderator/1;color=#9147FF;display-name=User;emotes=;id=abc-123;mod=1;room-id=12345;subscriber=0;tmi-sent-ts=1234567890;turbo=0;user-id=12345;user-type=mod :user!user@user.tmi.twitch.tv PRIVMSG #channel :Hello world
```

**Parsed:**
```javascript
{
    tags: {
        badges: 'moderator/1',
        color: '#9147FF',
        'display-name': 'User',
        id: 'abc-123',
        mod: '1',
        'user-id': '12345'
    },
    prefix: 'user!user@user.tmi.twitch.tv',
    command: 'PRIVMSG',
    params: ['#channel', 'Hello world']
}
```

---

## Error Handling

### WebSocket Errors

**Twitch IRC:**
```javascript
ws.onerror = (error) => {
    console.error('[ChatIS] WebSocket error:', error);
};

ws.onclose = (event) => {
    if (!event.wasClean) {
        // Reconnect after 5 seconds
        setTimeout(() => connectToTwitch(), 5000);
    }
};
```

**7TV EventAPI:**
```javascript
// Exponential backoff
const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
setTimeout(() => connect(), delay);
```

### API Errors

**Twitch API:**
```javascript
const response = await twitchAPIproxy(path, params);
if (!response.ok) {
    console.error('API error:', response.status);
    return null;
}
```

**7TV API:**
```javascript
try {
    const response = await fetch(url);
    const data = await response.json();
} catch (error) {
    console.error('[7TV] API error:', error);
}
```

---

<p align="center">
  <strong>For more information, see the <a href="README.md">README</a> or <a href="DEVELOPMENT.md">Development Guide</a></strong>
</p>
