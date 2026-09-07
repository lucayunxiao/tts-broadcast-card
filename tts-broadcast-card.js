/**
 * TTS Broadcast Card
 * Repository: https://github.com/lucayunxiao/tts-broadcast-card
 * Version: 1.0.0
 * License: MIT
 *
 * A sleek, reactive text-to-speech broadcast card for Home Assistant Lovelace
 * featuring native zero-script orchestration, chime playback, Microsoft Edge TTS
 * multi-language voice detection, graphical configuration, and live state feedback.
 */

const SCHEMA = [
  {
    name: "media_player",
    label: "Media Player Entity",
    required: true,
    selector: { entity: { domain: "media_player" } }
  },
  {
    name: "tts_entity",
    label: "TTS Engine Entity (Optional, defaults to tts.edge_tts)",
    required: false,
    selector: { entity: { domain: "tts" } }
  },
  {
    name: "placeholder",
    label: "Input Placeholder",
    required: false,
    selector: { text: {} }
  },
  {
    type: "expandable",
    name: "chime_section",
    title: "Notification Chime",
    label: "Notification Chime",
    icon: "mdi:bell-ring-outline",
    flatten: true,
    schema: [
      {
        name: "chime_enabled",
        label: "Enable Pre-Broadcast Chime",
        selector: { boolean: {} }
      },
      {
        name: "chime_url",
        label: "Chime Audio URL / Media Source",
        selector: { text: {} }
      },
      {
        name: "chime_delay",
        label: "Chime Transition Delay (seconds)",
        selector: {
          number: {
            min: 0.5,
            max: 10,
            step: 0.5,
            mode: "slider",
            unit_of_measurement: "s"
          }
        }
      }
    ]
  },
  {
    type: "expandable",
    name: "appearance_section",
    title: "Appearance & Icons",
    label: "Appearance & Icons",
    icon: "mdi:palette-outline",
    flatten: true,
    schema: [
      {
        type: "grid",
        name: "title_grid",
        flatten: true,
        schema: [
          { name: "title", label: "Button Title", selector: { text: {} } },
          { name: "subtitle", label: "Button Subtitle", selector: { text: {} } }
        ]
      },
      {
        type: "grid",
        name: "color_grid",
        flatten: true,
        schema: [
          { name: "ready_color", label: "Ready Color (Hex/CSS)", selector: { text: {} } },
          { name: "active_color", label: "Active Color (Hex/CSS)", selector: { text: {} } }
        ]
      },
      {
        type: "grid",
        name: "icon_grid",
        flatten: true,
        schema: [
          { name: "input_icon", label: "Input Icon", selector: { icon: {} } },
          { name: "button_icon", label: "Button Icon", selector: { icon: {} } },
          { name: "badge_icon", label: "Badge Icon", selector: { icon: {} } },
          { name: "active_icon", label: "Active Icon", selector: { icon: {} } }
        ]
      }
    ]
  },
  {
    type: "expandable",
    name: "advanced_section",
    title: "Advanced Settings",
    label: "Advanced Settings",
    icon: "mdi:cog-outline",
    flatten: true,
    schema: [
      {
        name: "script",
        label: "Custom Broadcast Script (Optional override)",
        required: false,
        selector: { entity: { domain: "script" } }
      },
      {
        name: "input_text",
        label: "State Sync Entity (Optional)",
        required: false,
        selector: { entity: { domain: "input_text" } }
      }
    ]
  }
];

class TtsBroadcastCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._form = null;
  }

  _deepEqual(a, b) {
    if (a === b) return true;
    if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this._deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  setConfig(config) {
    const isSame = this._config && this._deepEqual(this._config, config);
    this._config = { ...config };

    if (!this._form) {
      this._render();
    } else if (!isSame) {
      this._form.data = this._config;
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) {
      this._form.hass = hass;
    }
  }

  _render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-form {
          display: block;
        }
      </style>
      <ha-form id="form"></ha-form>
    `;

    this._form = this.shadowRoot.getElementById("form");
    if (this._form) {
      this._form.schema = SCHEMA;
      this._form.data = this._config || {};
      this._form.hass = this._hass;
      this._form.computeLabel = (s) => s.label || s.title || s.name;
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._config = { ...ev.detail.value };
        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true
          })
        );
      });
    }
  }
}

customElements.define("tts-broadcast-card-editor", TtsBroadcastCardEditor);

class TtsBroadcastCard extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._sessionActive = false;
    this._sessionStartTime = 0;
    this._resetTimer = null;
    this._ticker = null;
  }

  static getConfigElement() {
    return document.createElement("tts-broadcast-card-editor");
  }

  static getConfigForm() {
    return {
      schema: SCHEMA,
      computeLabel: (s) => s.label || s.title || s.name
    };
  }

  static getStubConfig(hass, entities, entitiesFallback) {
    const defaultPlayer = entities?.find((e) => e.startsWith("media_player.")) || "media_player.living_room";
    const defaultTts = entities?.find((e) => e.startsWith("tts.")) || "tts.edge_tts";
    return {
      media_player: defaultPlayer,
      tts_entity: defaultTts,
      placeholder: "Message...",
      chime_enabled: true,
      chime_url: "media-source://media_source/local/notification.mp3",
      chime_delay: 3.5,
      title: "Broadcast",
      subtitle: "",
      ready_color: "#2196f3",
      active_color: "#ff5722",
      input_icon: "mdi:comment-text-outline",
      button_icon: "mdi:bullhorn",
      badge_icon: "mdi:send",
      active_icon: "mdi:volume-high"
    };
  }

  getCardSize() {
    return 1;
  }

  setConfig(config) {
    if (!config || !config.media_player) {
      throw new Error("Please specify a media_player entity in card configuration.");
    }
    this._config = {
      placeholder: "Message...",
      title: "Broadcast",
      subtitle: "",
      ready_color: "#2196f3",
      active_color: "#ff5722",
      input_icon: "mdi:comment-text-outline",
      button_icon: "mdi:bullhorn",
      badge_icon: "mdi:send",
      active_icon: "mdi:volume-high",
      tts_entity: "tts.edge_tts",
      chime_enabled: true,
      chime_url: "media-source://media_source/local/notification.mp3",
      chime_delay: 3.5,
      ...config
    };

    if (this._rendered) {
      this._updateStyles();
      this._updateState();
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._updateState();
  }

  disconnectedCallback() {
    this._clearTimers();
  }

  _clearTimers() {
    if (this._resetTimer) {
      clearTimeout(this._resetTimer);
      this._resetTimer = null;
    }
    if (this._ticker) {
      clearInterval(this._ticker);
      this._ticker = null;
    }
  }

  connectedCallback() {
    if (this._rendered) return;
    this._rendered = true;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style id="custom-styles"></style>
      <style>
        :host {
          display: block;
        }
        .card {
          display: flex;
          align-items: center;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border-radius: var(--ha-card-border-radius, 12px);
          border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
          box-shadow: var(--ha-card-box-shadow, none);
          padding: 6px 12px;
          gap: 8px;
          box-sizing: border-box;
          transition: border-color 0.4s ease, box-shadow 0.4s ease, background 0.3s ease;
        }
        .card.broadcasting {
          border-color: var(--active-color, #ff5722) !important;
          box-shadow: 0 0 14px var(--active-shadow, rgba(255, 87, 34, 0.35)) !important;
        }
        .input-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .input-icon {
          color: var(--secondary-text-color, #888);
          --mdc-icon-size: 20px;
          display: flex;
          align-items: center;
        }
        input {
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--primary-text-color, #fff);
          outline: none;
          font-family: inherit;
          padding: 8px 0;
        }
        input::placeholder {
          color: var(--secondary-text-color, #888);
          opacity: 0.7;
        }
        .divider {
          width: 1px;
          height: 32px;
          background: var(--divider-color, rgba(255, 255, 255, 0.12));
          flex-shrink: 0;
        }
        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          padding: 4px 8px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--primary-text-color, #fff);
          font-family: inherit;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
          transition: background-color 0.2s, transform 0.15s ease;
        }
        .btn:hover {
          background: rgba(var(--rgb-primary-text, 255, 255, 255), 0.06);
        }
        .btn:active {
          transform: scale(0.97);
        }
        .icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--ready-bg, rgba(33, 150, 243, 0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.4s ease;
          position: relative;
        }
        .icon-circle ha-icon {
          color: var(--ready-color, #2196f3);
          --mdc-icon-size: 20px;
          transition: color 0.4s ease;
        }
        .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--ready-color, #2196f3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.4s ease;
        }
        .badge ha-icon {
          color: #fff;
          --mdc-icon-size: 10px;
        }
        .card.broadcasting .icon-circle {
          background: var(--active-bg, rgba(255, 87, 34, 0.2));
        }
        .card.broadcasting .icon-circle ha-icon {
          color: var(--active-color, #ff5722);
        }
        .card.broadcasting .badge {
          background: var(--active-color, #ff5722);
        }
        .pulse-anim {
          animation: tbc-pulse 1.8s ease-in-out infinite;
        }
        @keyframes tbc-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
          100% { transform: scale(1); opacity: 1; }
        }
        .text-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .primary-text {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.2;
          color: var(--primary-text-color, #fff);
          transition: color 0.3s ease;
        }
        .secondary-text {
          font-size: 11px;
          color: var(--secondary-text-color, #888);
          line-height: 1.2;
        }
      </style>
      <div class="card" id="card">
        <div class="input-box">
          <ha-icon class="input-icon" id="inputIconEl" icon="mdi:comment-text-outline"></ha-icon>
          <input type="text" id="msgInput" placeholder="Message..." enterkeyhint="send" autocomplete="off" />
        </div>
        <div class="divider"></div>
        <button class="btn" id="sendBtn" type="button">
          <div class="icon-circle" id="iconCircle">
            <ha-icon id="mainIcon" icon="mdi:bullhorn"></ha-icon>
            <div class="badge" id="badgeEl">
              <ha-icon id="badgeIcon" icon="mdi:send"></ha-icon>
            </div>
          </div>
          <div class="text-group">
            <span class="primary-text" id="primaryText">Broadcast</span>
            <span class="secondary-text" id="secondaryText">Media Player</span>
          </div>
        </button>
      </div>
    `;

    const input = this.shadowRoot.getElementById("msgInput");
    const btn = this.shadowRoot.getElementById("sendBtn");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (input) input.blur();
      this._handleSend();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
        this._handleSend();
      }
    });

    this._updateStyles();
    this._updateState();
  }

  _updateStyles() {
    if (!this.shadowRoot) return;
    const styleEl = this.shadowRoot.getElementById("custom-styles");
    if (!styleEl) return;

    const readyColor = this._config.ready_color || "#2196f3";
    const activeColor = this._config.active_color || "#ff5722";

    styleEl.textContent = `
      :host {
        --ready-color: ${readyColor};
        --ready-bg: ${readyColor}26;
        --active-color: ${activeColor};
        --active-bg: ${activeColor}33;
        --active-shadow: ${activeColor}59;
      }
    `;
  }

  async _handleSend() {
    const input = this.shadowRoot?.getElementById("msgInput");
    if (!input) return;
    const text = (input.value || "").trim();
    if (!text) return;

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    input.value = "";
    this._startSession();

    try {
      // Optional input_text synchronization if configured
      if (this._config.input_text) {
        this._hass.callService("input_text", "set_value", {
          entity_id: this._config.input_text,
          value: text
        }).catch((err) => console.warn("Sync to input_text failed:", err));
      }

      // If a custom script is specified in Advanced settings, delegate to it
      if (this._config.script) {
        await this._hass.callService(
          "script",
          this._config.script.replace(/^script\./, ""),
          { message: text }
        );
      } else {
        // Native Zero-Script Broadcast Pipeline
        const mediaPlayer = this._config.media_player;
        const ttsEntity = this._config.tts_entity || "tts.edge_tts";
        const chimeEnabled = this._config.chime_enabled !== false;
        const chimeUrl = this._config.chime_url || "media-source://media_source/local/notification.mp3";
        const chimeDelay = Number(this._config.chime_delay ?? 3.5);

        // Stage 1: Pre-broadcast chime (if enabled)
        if (chimeEnabled && chimeUrl) {
          await this._hass.callService(
            "media_player",
            "play_media",
            {
              media_content_id: chimeUrl,
              media_content_type: "music"
            },
            { entity_id: mediaPlayer }
          );

          // Stage 2: Safe transition delay to let speaker buffer clear
          if (chimeDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, chimeDelay * 1000));
          }
        }

        // Stage 3: Multi-language voice detection
        let voice = "en-US-JennyNeural";
        if (/[\u4e00-\u9fff]/.test(text)) {
          voice = "zh-CN-XiaoxiaoNeural";
        } else if (/[\u3040-\u30ff]/.test(text)) {
          voice = "ja-JP-NanamiNeural";
        } else if (/[\uac00-\ud7af]/.test(text)) {
          voice = "ko-KR-SunHiNeural";
        }

        // Stage 4: Text-to-speech execution
        const speakData = {
          media_player_entity_id: mediaPlayer,
          message: text
        };
        if (ttsEntity.toLowerCase().includes("edge")) {
          speakData.options = { voice: voice };
        }

        await this._hass.callService(
          "tts",
          "speak",
          speakData,
          { entity_id: ttsEntity }
        );
      }
    } catch (err) {
      console.error("TTS Broadcast error:", err);
    }
  }

  _startSession() {
    this._clearTimers();
    this._sessionActive = true;
    this._sessionStartTime = Date.now();
    this._updateState();

    this._ticker = setInterval(() => {
      this._updateState();
    }, 500);
  }

  _endSession() {
    this._sessionActive = false;
    this._clearTimers();
    this._updateState();
  }

  _updateState() {
    if (!this.shadowRoot) return;
    const card = this.shadowRoot.getElementById("card");
    const input = this.shadowRoot.getElementById("msgInput");
    const inputIcon = this.shadowRoot.getElementById("inputIconEl");
    const iconCircle = this.shadowRoot.getElementById("iconCircle");
    const mainIcon = this.shadowRoot.getElementById("mainIcon");
    const badgeIcon = this.shadowRoot.getElementById("badgeIcon");
    const primaryText = this.shadowRoot.getElementById("primaryText");
    const secondaryText = this.shadowRoot.getElementById("secondaryText");

    if (!card || !mainIcon) return;

    // Apply configured placeholder and icons
    if (input && this._config.placeholder) {
      input.placeholder = this._config.placeholder;
    }
    if (inputIcon) {
      inputIcon.setAttribute("icon", this._config.input_icon || "mdi:comment-text-outline");
    }

    const playerStateObj = this._hass && this._hass.states[this._config.media_player];
    const isPlaying = playerStateObj && playerStateObj.state === "playing";

    const scriptStateObj = this._config.script && this._hass && this._hass.states[this._config.script];
    const isScriptOn = scriptStateObj && scriptStateObj.state === "on";

    if (this._sessionActive) {
      const elapsed = Date.now() - this._sessionStartTime;

      // Hard timeout guard (16 seconds maximum failsafe)
      if (elapsed > 16000) {
        this._endSession();
        return;
      }

      // Smooth debounce after minimum playback window
      const chimeWait = this._config.chime_enabled !== false ? (Number(this._config.chime_delay ?? 3.5) * 1000) : 0;
      const minWindow = Math.max(3000, chimeWait + 1500);

      if (elapsed > minWindow && !isPlaying && !isScriptOn) {
        if (!this._resetTimer) {
          this._resetTimer = setTimeout(() => {
            this._endSession();
          }, 1000);
        }
      } else {
        if (this._resetTimer) {
          clearTimeout(this._resetTimer);
          this._resetTimer = null;
        }
      }
    }

    if (this._sessionActive) {
      card.className = "card broadcasting";
      if (iconCircle) iconCircle.classList.add("pulse-anim");
      mainIcon.setAttribute("icon", this._config.active_icon || "mdi:volume-high");
      badgeIcon.setAttribute("icon", "mdi:waveform");
      primaryText.textContent = "Broadcasting...";
      secondaryText.textContent = "Active 🔊";
    } else {
      card.className = "card";
      if (iconCircle) iconCircle.classList.remove("pulse-anim");
      mainIcon.setAttribute("icon", this._config.button_icon || "mdi:bullhorn");
      badgeIcon.setAttribute("icon", this._config.badge_icon || "mdi:send");
      primaryText.textContent = this._config.title || "Broadcast";
      secondaryText.textContent =
        this._config.subtitle !== undefined && this._config.subtitle !== ""
          ? this._config.subtitle
          : playerStateObj?.attributes?.friendly_name || "Media Player";
    }
  }
}

customElements.define("tts-broadcast-card", TtsBroadcastCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "tts-broadcast-card",
  name: "TTS Broadcast Card",
  description: "A reactive text-to-speech broadcast card with customizable chime, player, colors, and live state feedback.",
  preview: true,
  documentationURL: "https://github.com/lucayunxiao/tts-broadcast-card"
});
