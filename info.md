# TTS Broadcast Card for Home Assistant Lovelace

A sleek, reactive text-to-speech broadcast card with interactive in-card volume controls, hardware delegation, pre-broadcast chime support, zero-script configuration, multi-language Edge TTS neural voice detection, and live state feedback.

## Key Highlights
- **Zero Backend Scripts Needed**: 100% frontend orchestration calling native HA services directly.
- **Interactive In-Card Volume Control**: Volume pill (click to toggle mute/restore) and slider with local storage memory.
- **Hardware Volume Delegation**: Decouple streaming media players from amplifier/controller volume entities.
- **Auto-Unmute & Volume Restoration**: Never miss alerts due to mute, broadcast at custom volume, and automatically restore original speaker volume and mute status afterwards.
- **UPnP Auto-Stop Session Release**: Automatically release UPnP session lock to restore TV optical/HDMI sound.
- **Pre-broadcast Notification Chime**: Built-in chime trigger with configurable speaker transition delay.
- **Multi-language Edge TTS Voice Auto-Detection**: Chinese (Xiaoxiao), English (Jenny), Japanese (Nanami), and Korean (SunHi).
- **Graphical Card Editor**: 5-tier visual settings form built with native `<ha-form>`.
- **Live Status Pulse & Failsafe Watchdog**: Real-time state reflection with an 18s watchdog timer.

Check the repository [README](https://github.com/lucayunxiao/tts-broadcast-card#readme) for full installation and configuration instructions.
