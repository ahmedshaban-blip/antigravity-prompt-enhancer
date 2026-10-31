"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsHtml = getSettingsHtml;
const settingsStyles_1 = require("./settingsStyles");
const settingsScript_1 = require("./settingsScript");
/**
 * Returns the complete HTML document for the Settings Webview
 */
function getSettingsHtml() {
    const styles = (0, settingsStyles_1.getSettingsStyles)();
    const script = (0, settingsScript_1.getSettingsScript)();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Prompt Enhancer</title>
  <style>
    ${styles}
  </style>
</head>
<body>

  <div class="header">
    <div class="title-group">
      <h2>Prompt Enhancer</h2>
      <span class="badge">v1.0.3</span>
    </div>
  </div>

  <div class="section-title">AI Provider Engine</div>
  <div class="provider-grid">
    <!-- Option 1: OpenRouter -->
    <div class="provider-card" id="card-openrouter" onclick="selectProvider('openrouter')">
      <input type="radio" name="provider" value="openrouter" id="radio-openrouter">
      <div class="provider-info">
        <div class="provider-name">
          <span>OpenRouter</span>
          <span class="pill-free">MULTI-MODEL</span>
        </div>
        <div class="provider-desc">Claude 3.5 Sonnet, DeepSeek V3/R1, Llama 3.3.</div>
      </div>
    </div>

    <!-- Option 2: Google Gemini -->
    <div class="provider-card" id="card-gemini" onclick="selectProvider('gemini')">
      <input type="radio" name="provider" value="gemini" id="radio-gemini">
      <div class="provider-info">
        <div class="provider-name">
          <span>Google Gemini API</span>
          <span class="pill-free">FREE TIER</span>
        </div>
        <div class="provider-desc">Official Google AI Studio API (Flash / Pro).</div>
      </div>
    </div>

    <!-- Option 3: OpenAI / Custom REST -->
    <div class="provider-card" id="card-openai_compatible" onclick="selectProvider('openai_compatible')">
      <input type="radio" name="provider" value="openai_compatible" id="radio-openai_compatible">
      <div class="provider-info">
        <div class="provider-name">
          <span>Custom / OpenAI REST</span>
        </div>
        <div class="provider-desc">Groq, DeepSeek Direct, Ollama Local, vLLM.</div>
      </div>
    </div>
  </div>

  <!-- Dynamic Settings: OpenRouter -->
  <div id="section-openrouter" style="display: none;">
    <div class="form-group">
      <label for="openrouterApiKey">OpenRouter API Key</label>
      <div class="input-wrapper">
        <input type="password" id="openrouterApiKey" placeholder="sk-or-v1-..." autocomplete="off">
        <button type="button" class="toggle-visibility" onclick="togglePass('openrouterApiKey')">👁</button>
      </div>
    </div>
    <div class="form-group">
      <label for="openrouterModel">Model Identifier</label>
      <input type="text" id="openrouterModel" value="anthropic/claude-3.5-sonnet" placeholder="anthropic/claude-3.5-sonnet">
    </div>
  </div>

  <!-- Dynamic Settings: Gemini -->
  <div id="section-gemini" style="display: none;">
    <div class="form-group">
      <label for="geminiApiKey">Gemini API Key</label>
      <div class="input-wrapper">
        <input type="password" id="geminiApiKey" placeholder="AIzaSy..." autocomplete="off">
        <button type="button" class="toggle-visibility" onclick="togglePass('geminiApiKey')">👁</button>
      </div>
    </div>
    <div class="form-group">
      <label for="geminiModel">Model Identifier</label>
      <input type="text" id="geminiModel" value="gemini-2.5-flash" placeholder="gemini-2.5-flash">
    </div>
  </div>

  <!-- Dynamic Settings: OpenAI-Compatible -->
  <div id="section-openai" style="display: none;">
    <div class="form-group">
      <label for="openaiBaseUrl">API Base URL</label>
      <input type="text" id="openaiBaseUrl" value="https://api.openai.com/v1" placeholder="https://api.openai.com/v1">
    </div>
    <div class="form-group">
      <label for="openaiApiKey">API Key</label>
      <div class="input-wrapper">
        <input type="password" id="openaiApiKey" placeholder="sk-..." autocomplete="off">
        <button type="button" class="toggle-visibility" onclick="togglePass('openaiApiKey')">👁</button>
      </div>
    </div>
    <div class="form-group">
      <label for="openaiModel">Model Identifier</label>
      <input type="text" id="openaiModel" value="gpt-4o-mini" placeholder="gpt-4o-mini / llama-3.3-70b-versatile">
    </div>
  </div>

  <!-- General Settings: Max Files -->
  <div class="form-group" style="margin-top: 14px;">
    <div class="slider-header">
      <label for="maxContextFiles" style="margin: 0;">Max Scouted Files</label>
      <span class="slider-val" id="maxFilesVal">3</span>
    </div>
    <input type="range" id="maxContextFiles" min="1" max="10" value="3" oninput="updateSliderVal(this.value)">
  </div>

  <!-- Action Buttons -->
  <div class="btn-row">
    <button class="btn-primary" onclick="saveSettings()">Save Settings</button>
    <button class="btn-secondary" onclick="testConnection()">Test</button>
  </div>

  <!-- Diagnostics Box -->
  <div class="status-banner" id="statusBanner"></div>

  <!-- Quick Trigger Info Card -->
  <div class="quick-trigger-card">
    <div class="shortcut-hint">
      <span>Enhance in-place shortcut:</span>
      <kbd>Ctrl+Alt+E</kbd>
    </div>
    <div style="margin-top: 8px;">
      <button class="btn-secondary" style="width: 100%;" onclick="runEnhancement()">Trigger Enhancement Now</button>
    </div>
  </div>

  <script>
    ${script}
  </script>
</body>
</html>`;
}
//# sourceMappingURL=settingsHtml.js.map