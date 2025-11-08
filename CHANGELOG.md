# yChat Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Modern UI redesign (card-based layout, platform tabs)
- Kick platform support (WebSocket, emotes, badges)
- Platform badge display (Twitch/Kick logos)
- 7TV support for Kick emotes
- Multi-platform simultaneous chat display

---

## [2.5.0] - 2024-01-15

### Added
- **TTS (Text-to-Speech)** via StreamElements public API
  - Amazon Polly voices (Brian, Joanna, Kendra, Matthew, etc.)
  - Voice selection with `-s <voice>` parameter
  - Volume control with `-v <0-1>` parameter
  - Command: `!chatis tts [-s voice] [-v volume] <text>`
- **Comprehensive documentation suite**
  - README.md (main documentation)
  - SETUP.md (streamer setup guide)
  - DOCS.md (API reference)
  - DEVELOPMENT.md (development guide)
  - CHANGELOG.md (this file)

### Changed
- **TTS backend switched** from hardcoded chatis.is2511.com to StreamElements API
  - No authentication required
  - Direct URL generation (no POST request)
  - Removed JSON parsing complexity
- **Simplified TTS implementation** in v2/script.js (lines 2220-2225)

### Fixed
- TTS unavailable due to unreachable backend server
- TTS audio playback reliability issues

---

## [2.4.0] - 2024-01-10

### Added
- **Worker params handling** for channel-specific API calls
  - Supports `?params=broadcaster_id=123` query parameter
  - Enables channel-specific badge loading
  - Fixed 400 errors from Twitch API

### Changed
- **worker-deploy.js** updated to parse and forward `params` parameter
  - Lines 28-30: Parse `path` and `params` from URL
  - Lines 39-42: Build Twitch API URL with optional params

### Fixed
- **Channel-specific badges not loading** (400 error from Twitch API)
- Badge loading failures on production deployment

---

## [2.3.0] - 2024-01-05

### Added
- **Cloudflare Pages deployment** at chat.yaseen.zip
  - Connected to GitHub repository YaseenHQ/ChatIS
  - Automatic deployments on push to main branch
  - Custom domain with SSL certificate
- **GitHub repository** setup
  - Initialized Git repository
  - Pushed code to GitHub
  - Configured user email (hello@yaseen.in)

### Changed
- **Dynamic URL paths** using `window.location.origin`
  - Badge URLs (lines 217-235 in v2/script.js)
  - Replaced hardcoded paths with dynamic paths
  - Better compatibility with different hosting environments

### Fixed
- **Cloudflare Pages deployment issues**
  - Removed conflicting GitHub Actions workflow
  - Set root directory to `/` (not `/v2`)
  - Fixed "Hello world" placeholder page issue

---

## [2.2.0] - 2024-01-01

### Added
- **Cloudflare Worker API proxy** at api.yaseen.zip
  - Proxies Twitch Helix API requests
  - Adds Client-ID and Authorization headers
  - Returns CORS-enabled responses
- **Worker security** with Referer checking
  - Allows empty Referer (for OBS Browser Source)
  - Allows chat.yaseen.zip Referer
  - Blocks other domains (403 Forbidden)
- **Environment variables** in Cloudflare Worker
  - TWITCH_CLIENT_ID (encrypted)
  - TWITCH_ACCESS_TOKEN (encrypted)
  - Not stored in code (security)

### Changed
- **API proxy URL** updated to api.yaseen.zip
  - Line 52 in v2/script.js: `twitchAPIproxy` variable
  - Replaced placeholder URL with custom domain

### Removed
- **Hardcoded Twitch credentials** from codebase
  - Moved to Cloudflare Worker environment variables
  - Added to .gitignore (cloudflare-worker-secure.js)

---

## [2.1.0] - 2023-12-20

### Added
- **Superadmin access level** (2000) for yaseen
  - Lines 1899-1913 in v2/script.js
  - yaseen: 2000 (superadmin)
  - is2511: 1000 (original creator)
- **Badge reordering** to Chatterino hierarchy
  - Broadcaster → Moderator → VIP → Subscriber → Special badges
  - Matches Chatterino's familiar layout
  - Better visual consistency for Chatterino users

### Changed
- **Access level system** updated
  - USER: 0
  - MOD: 500
  - SPECIAL: 700
  - BROADCASTER: 1000
  - SUPERADMIN: 2000 (new)

---

## [2.0.0] - 2023-12-15

### Changed
- **Forked from ChatIS** (IS2511) to yChat (yaseen)
- **Project renamed** from ChatIS to yChat
- **Custom domain** changed to chat.yaseen.zip
- **API proxy domain** changed to api.yaseen.zip

---

## [ChatIS History]

_Below is the version history from the original ChatIS project by IS2511._

---

## [1.34.4] - 2023-11-01

### Added
- 7TV EventAPI v3 support (real-time emote updates)
- 7TV cosmetics (paints, badges)
- Chatterino badges
- FFZ:AP badges

### Changed
- Improved emote loading performance
- Updated 7TV API endpoints to v3

### Fixed
- 7TV emote updates not reflecting in real-time
- Badge loading race conditions

---

## [1.30.0] - 2023-08-15

### Added
- Custom font support (`fontCustom` parameter)
- Emote scale parameter (`emoteScale`)
- Bot name filtering (`botNames` parameter)

### Changed
- Improved bot detection logic
- Better handling of deleted messages

---

## [1.25.0] - 2023-06-01

### Added
- Message fading (`fade` parameter)
- Animation support (`animate` parameter)
- Small caps variant (`small_caps` parameter)

### Fixed
- Memory leaks from unbounded message history
- Animation performance issues

---

## [1.20.0] - 2023-04-10

### Added
- BTTV emote support
- FFZ emote support
- Custom badge support

### Changed
- Refactored emote loading into modular functions
- Improved error handling for API failures

---

## [1.10.0] - 2023-02-01

### Added
- Basic 7TV emote support
- Twitch badge loading
- Custom stroke and shadow variants

### Changed
- Migrated from Twitch IRC v1 to WebSocket
- Updated to IRC v3 tags

---

## [1.0.0] - 2022-12-01

### Added
- Initial ChatIS release (fork of jChat)
- Basic Twitch chat overlay functionality
- Font, size, stroke, shadow customization
- OBS Browser Source compatibility

---

## [jChat History]

_Below is the version history from the original jChat project by giambaJ._

---

## [0.5.0] - 2022-06-01

### Added
- Initial jChat release
- Basic Twitch chat display
- Simple customization options

---

## Legend

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

<p align="center">
  <strong>For latest changes, see the <a href="https://github.com/YaseenHQ/ChatIS/commits/main">commit history</a></strong>
</p>
