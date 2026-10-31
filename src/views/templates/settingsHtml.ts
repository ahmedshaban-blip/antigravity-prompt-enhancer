import { getSettingsStyles } from './settingsStyles';
import { getSettingsScript } from './settingsScript';

/**
 * Returns the complete HTML document for the Settings Webview
 */
export function getSettingsHtml(): string {
  const styles = getSettingsStyles();
  const script = getSettingsScript();

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
      <span class="badge">v1.0.2</span>
    </div>
  </div>

  <div class="section-title">AI Provider Engine</div>
  <div class="provider-grid">
    <!-- Option 1: Internal Antigravity Context -->
    <div class="provider-card" id="card-internal" onclick="selectProvider('internal')">
      <input type="radio" name="provider" value="internal" id="radio-internal">
      <div class="provider-info">
        <div class="provider-name">
          <span>Antigravity Context</span>
          <span class="pill-free">ZERO TOKENS</span>
        </div>
        <div class="provider-desc">Local workspace scouting; ready for Antigravity Chat.</div>
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

    <!-- Option 3: OpenAI-Compatible -->
    <div class="provider-card" id="card-openai_compatible" onclick="selectProvider('openai_compatible')">
      <input type="radio" name="provider" value="openai_compatible" id="radio-openai_compatible">
      <div class="provider-info">
        <div class="provider-name">
          <span>OpenAI / Custom REST</span>
        </div>
        <div class="provider-desc">Groq, OpenRouter, DeepSeek, Ollama, vLLM.</div>
      </div>
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
