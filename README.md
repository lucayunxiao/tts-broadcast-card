# TTS Broadcast Card

<p align="center">
  <a href="https://github.com/hacs/default"><img src="https://img.shields.io/badge/HACS-Custom-41bdf5.svg?style=for-the-badge&logo=homeassistant" alt="HACS Custom"></a>
  <a href="https://github.com/lucayunxiao/tts-broadcast-card/releases"><img src="https://img.shields.io/github/v/release/lucayunxiao/tts-broadcast-card?style=for-the-badge&color=2196f3" alt="GitHub Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
  <img src="https://img.shields.io/badge/HA-2024.1%2B-blue.svg?style=for-the-badge&logo=homeassistant" alt="Home Assistant 2024.1+">
</p>

<p align="center">
  <b>A modern, zero-configuration reactive TTS broadcast card for Home Assistant Lovelace</b><br/>
  Featuring native chime playback, Microsoft Edge TTS neural multi-language auto-detection, visual GUI form editor, and real-time state feedback.
</p>

<p align="center">
  <a href="README.md"><b>English</b></a> | <a href="README_zh.md"><b>简体中文</b></a>
</p>

---

## 📸 Preview

![TTS Broadcast Card Preview](assets/preview.png)

<p align="center">
  <img src="assets/banner.svg" alt="Architecture & States" width="100%"/>
</p>

---

## ✨ Features

- ⚡ **Zero-Script Out-of-the-Box**: Orchestrates the entire broadcast pipeline directly from frontend Web Components. No complex backend YAML scripts or automations required!
- 🔔 **Pre-Broadcast Notification Chime**: Plays a chime/bell sound before speaking, with a configurable speaker transition buffer (`chime_delay`) to prevent audio cut-offs on DLNA, Google Cast, Sonos, or AirPlay speakers.
- 🌐 **Microsoft Edge TTS Neural Voice Auto-Detection**: Automatically detects input language and routes to native neural voices:
  - 🇨🇳 Chinese $\to$ `zh-CN-XiaoxiaoNeural` (晓晓)
  - 🇺🇸 English $\to$ `en-US-JennyNeural` (Jenny)
  - 🇯🇵 Japanese $\to$ `ja-JP-NanamiNeural` (Nanami / 七海)
  - 🇰🇷 Korean $\to$ `ko-KR-SunHiNeural` (SunHi / 善喜)
- 🎛️ **Full Graphical Visual Configurator**: Clean 4-tier expandable `<ha-form>` editor (Core Settings, Notification Chime, Appearance & Icons, Advanced Settings).
- 🛡️ **Debounced State & 16s Watchdog**: Dynamic pulse animation during playback, real-time media player state tracking, and a failsafe safety reset watchdog.
- 🔄 **Backward Compatible**: Supports optional custom script delegation and `input_text` state synchronization for power users.

---

## 📦 Prerequisites (Recommended)

### 🎙️ Microsoft Edge TTS Integration

While this card can work with any Home Assistant TTS entity (`tts.piper`, `tts.google_translate`, `tts.cloud`, etc.), it is **specifically optimized for Microsoft Edge TTS** (`tts.edge_tts`). 

Installing the [hass-edge-tts](https://github.com/hasscc/hass-edge-tts) integration grants you access to Microsoft's high-fidelity neural voices across 400+ voices completely **free without cloud subscription fees**:

1. Open **HACS** in Home Assistant.
2. Search for **Edge TTS** and click **Download**.
3. Restart Home Assistant and add **Edge TTS** in **Settings > Devices & Services > Add Integration**.

> [!NOTE]
> If you choose to use another TTS provider (e.g. `tts.piper` or `tts.google_translate`), you can simply select your engine in the card's visual editor under **TTS Engine Entity**. The card will gracefully fallback to standard TTS speak calls.

---

## 🚀 Installation

### Method 1: Via HACS (Recommended)

1. Open **HACS** in your Home Assistant dashboard.
2. Click the top-right three dots menu `⋮` and select **Custom repositories**.
3. In the dialog, enter:
   - **Repository**: `https://github.com/lucayunxiao/tts-broadcast-card`
   - **Type**: `Dashboard` (or `Plugin`)
4. Click **Add**.
5. Search for `TTS Broadcast Card` in HACS, click **Download**, and reload your browser.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=lucayunxiao&repository=tts-broadcast-card&category=plugin)

### Method 2: Manual Installation

1. Download [`dist/tts-broadcast-card.js`](https://raw.githubusercontent.com/lucayunxiao/tts-broadcast-card/main/dist/tts-broadcast-card.js).
2. Copy `tts-broadcast-card.js` into your Home Assistant `<config>/www/` directory.
3. In Home Assistant, navigate to **Settings > Dashboards > Three dots (top-right) > Resources**.
4. Click **Add Resource**, set URL to `/local/tts-broadcast-card.js?v=1.0.0` and Resource type to `JavaScript Module`.
5. Refresh your browser cache.

---

## 🛠️ Configuration

### Graphical User Interface (UI Editor)

Add a new card to your dashboard and select **TTS Broadcast Card**. The visual editor is organized into 4 collapsible sections:

1. **Core Settings**:
   - `media_player` (*Required*): Target speaker entity.
   - `tts_entity` (*Optional*): TTS engine entity (defaults to `tts.edge_tts`).
   - `placeholder` (*Optional*): Input placeholder text (default: `Message...`).
2. **Notification Chime**:
   - `chime_enabled`: Toggle pre-broadcast chime audio on/off.
   - `chime_url`: URL or media path (`media-source://...`, `/local/...`, or HTTP URL).
   - `chime_delay`: Slider (0.5s ~ 10.0s) to allow hardware audio buffer to flush before TTS speaks.
3. **Appearance & Icons**:
   - `title` & `subtitle`: Button header text.
   - `ready_color` & `active_color`: Hex or CSS colors for idle and broadcasting states.
   - `input_icon`, `button_icon`, `badge_icon`, `active_icon`: Custom MDI icons.
4. **Advanced Settings**:
   - `script`: Optional custom backend script override.
   - `input_text`: Optional text helper entity to sync message contents.

---

### YAML Example

```yaml
type: custom:tts-broadcast-card
media_player: media_player.living_room_speaker
tts_entity: tts.edge_tts
placeholder: "Type a message to broadcast..."
chime_enabled: true
chime_url: media-source://media_source/local/notification.mp3
chime_delay: 3.5
title: "Broadcast"
subtitle: "Living Room"
ready_color: "#2196f3"
active_color: "#ff5722"
input_icon: mdi:comment-text-outline
button_icon: mdi:bullhorn
badge_icon: mdi:send
active_icon: mdi:volume-high
```

---

## 📋 Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `media_player` | string | **Required** | Entity ID of target speaker (`media_player.xxx`). |
| `tts_entity` | string | `tts.edge_tts` | Entity ID of TTS engine. |
| `placeholder` | string | `Message...` | Text box placeholder text. |
| `chime_enabled` | boolean | `true` | Whether to play a pre-broadcast notification sound. |
| `chime_url` | string | `media-source://media_source/local/notification.mp3` | Audio URL or path for notification chime. |
| `chime_delay` | number | `3.5` | Transition delay (in seconds) between chime and speech. |
| `title` | string | `Broadcast` | Primary label on action button. |
| `subtitle` | string | Friendly name | Secondary label on button (defaults to speaker name). |
| `ready_color` | string | `#2196f3` | Accent color when card is idle. |
| `active_color` | string | `#ff5722` | Glow and accent color when broadcasting. |
| `input_icon` | string | `mdi:comment-text-outline` | Icon inside input text box. |
| `button_icon` | string | `mdi:bullhorn` | Idle state icon. |
| `badge_icon` | string | `mdi:send` | Idle state badge icon. |
| `active_icon` | string | `mdi:volume-high` | Active broadcasting icon. |
| `script` | string | *None* | Advanced: Custom script entity to override native pipeline. |
| `input_text` | string | *None* | Advanced: Optional helper entity to mirror message text. |

---

## ❓ FAQ & Troubleshooting

<details>
<summary><b>1. Why does my speaker clip off the first word of the announcement?</b></summary>
Network and wireless speakers (Chromecast, DLNA, AirPlay) often need a short warmup period when switching from idle or playing chime to speech. Increase <code>chime_delay</code> (e.g. to 3.5s - 4.5s) in card configuration to give the speaker adequate buffer time.
</details>

<details>
<summary><b>2. How can I prepare a local chime file?</b></summary>
Upload an mp3 file to your Home Assistant media directory (<b>Media > Local Media</b>) or <code>/config/www/notification.mp3</code>, and specify <code>media-source://media_source/local/notification.mp3</code> or <code>/local/notification.mp3</code> as <code>chime_url</code>.
</details>

<details>
<summary><b>3. Does it support Enter key to send?</b></summary>
Yes! Pressing the <kbd>Enter</kbd> key on desktop or the <kbd>Send</kbd> action key on mobile virtual keyboards will automatically dispatch the announcement and clear the input field.
</details>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
