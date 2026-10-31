"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsWebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
const settings_1 = require("../config/settings");
class SettingsWebviewProvider {
    _extensionUri;
    _llmRouter;
    static viewType = 'antigravityEnhancer.settingsView';
    _view;
    constructor(_extensionUri, _llmRouter) {
        this._extensionUri = _extensionUri;
        this._llmRouter = _llmRouter;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Initial state dispatch
        this.sendCurrentConfig();
        // Handle messages sent from the Webview script
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'saveSettings': {
                    await this.handleSaveSettings(message.payload);
                    break;
                }
                case 'testConnection': {
                    await this.handleTestConnection(message.payload);
                    break;
                }
                case 'triggerEnhance': {
                    await vscode.commands.executeCommand('antigravityEnhancer.enhancePrompt');
                    break;
                }
                case 'refresh': {
                    this.sendCurrentConfig();
                    break;
                }
            }
        });
        // Listen to changes in configuration from VS Code settings editor
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(settings_1.CONFIG_SECTION)) {
                this.sendCurrentConfig();
            }
        });
    }
    sendCurrentConfig() {
        if (!this._view)
            return;
        const config = (0, settings_1.getExtensionConfig)();
        this._view.webview.postMessage({
            type: 'loadConfig',
            config
        });
    }
    async handleSaveSettings(payload) {
        const config = vscode.workspace.getConfiguration(settings_1.CONFIG_SECTION);
        try {
            await config.update('provider', payload.provider, vscode.ConfigurationTarget.Global);
            await config.update('geminiApiKey', payload.geminiApiKey, vscode.ConfigurationTarget.Global);
            await config.update('geminiModel', payload.geminiModel, vscode.ConfigurationTarget.Global);
            await config.update('openaiBaseUrl', payload.openaiBaseUrl, vscode.ConfigurationTarget.Global);
            await config.update('openaiApiKey', payload.openaiApiKey, vscode.ConfigurationTarget.Global);
            await config.update('openaiModel', payload.openaiModel, vscode.ConfigurationTarget.Global);
            await config.update('maxContextFiles', Number(payload.maxContextFiles), vscode.ConfigurationTarget.Global);
            this._view?.webview.postMessage({
                type: 'statusMessage',
                status: 'success',
                text: 'Settings saved successfully'
            });
            vscode.window.setStatusBarMessage('✅ Antigravity Enhancer settings saved', 3000);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._view?.webview.postMessage({
                type: 'statusMessage',
                status: 'error',
                text: `Failed to save: ${msg}`
            });
        }
    }
    async handleTestConnection(payload) {
        const startTime = Date.now();
        this._view?.webview.postMessage({
            type: 'testStatus',
            status: 'testing',
            text: 'Testing connection...'
        });
        try {
            if (payload.provider === 'internal') {
                // Probe internal model
                const models = await vscode.lm.selectChatModels();
                const latency = Date.now() - startTime;
                if (models && models.length > 0) {
                    this._view?.webview.postMessage({
                        type: 'testStatus',
                        status: 'success',
                        text: `Connected to ${models[0].name || models[0].id} (${latency}ms)`
                    });
                }
                else {
                    this._view?.webview.postMessage({
                        type: 'testStatus',
                        status: 'info',
                        text: `Antigravity Context Mode ready (Local Engine, 0ms)`
                    });
                }
                return;
            }
            // Test with probe prompt
            const result = await this._llmRouter.generate('You are a connectivity test.', 'Reply with the single word: OK');
            const latency = Date.now() - startTime;
            this._view?.webview.postMessage({
                type: 'testStatus',
                status: 'success',
                text: `Success: "${result.slice(0, 30)}" (${latency}ms)`
            });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._view?.webview.postMessage({
                type: 'testStatus',
                status: 'error',
                text: `Connection failed: ${msg}`
            });
        }
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Prompt Enhancer</title>
  <style>
    :root {
      --radius-sm: 4px;
      --radius-md: 6px;
      --transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      padding: 12px;
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
      font-size: var(--vscode-font-size, 12px);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background);
      line-height: 1.45;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--vscode-panel-border, rgba(128, 128, 128, 0.2));
      margin-bottom: 14px;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .title-group h2 {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--vscode-sideBarTitle-foreground, #fff);
    }

    .badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background: var(--vscode-badge-background, #333);
      color: var(--vscode-badge-foreground, #eee);
      font-family: monospace;
      font-weight: 500;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      color: var(--vscode-descriptionForeground);
    }

    /* Segmented Cards for Provider */
    .provider-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }

    .provider-card {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 10px;
      border-radius: var(--radius-md);
      border: 1px solid var(--vscode-input-border, rgba(128, 128, 128, 0.2));
      background: var(--vscode-editor-background);
      cursor: pointer;
      transition: var(--transition);
      user-select: none;
    }

    .provider-card:hover {
      border-color: var(--vscode-focusBorder, #007acc);
      background: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.04));
    }

    .provider-card.active {
      border-color: var(--vscode-focusBorder, #007acc);
      background: var(--vscode-list-activeSelectionBackground, rgba(0, 122, 204, 0.15));
    }

    .provider-card input[type="radio"] {
      margin-top: 2px;
      accent-color: var(--vscode-focusBorder, #007acc);
    }

    .provider-info {
      flex: 1;
    }

    .provider-name {
      font-weight: 600;
      font-size: 12px;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .provider-desc {
      font-size: 10.5px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }

    .pill-free {
      font-size: 9px;
      font-weight: bold;
      color: #10b981;
      background: rgba(16, 185, 129, 0.12);
      padding: 1px 4px;
      border-radius: 3px;
    }

    /* Form Fields */
    .form-group {
      margin-bottom: 12px;
    }

    label {
      display: block;
      font-size: 11px;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--vscode-foreground);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    input[type="text"],
    input[type="password"],
    select {
      width: 100%;
      padding: 6px 8px;
      font-size: 12px;
      font-family: inherit;
      border-radius: var(--radius-sm);
      border: 1px solid var(--vscode-input-border, #444);
      background-color: var(--vscode-input-background, #1e1e1e);
      color: var(--vscode-input-foreground, #ccc);
      outline: none;
      transition: var(--transition);
    }

    input:focus,
    select:focus {
      border-color: var(--vscode-focusBorder, #007acc);
      box-shadow: 0 0 0 1px var(--vscode-focusBorder, #007acc);
    }

    .toggle-visibility {
      position: absolute;
      right: 6px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      padding: 2px 4px;
    }

    .toggle-visibility:hover {
      color: var(--vscode-foreground);
    }

    /* Slider Group */
    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .slider-val {
      font-family: monospace;
      font-weight: bold;
      color: var(--vscode-focusBorder, #007acc);
    }

    input[type="range"] {
      width: 100%;
      accent-color: var(--vscode-focusBorder, #007acc);
      cursor: pointer;
    }

    /* Actions */
    .btn-row {
      display: flex;
      gap: 6px;
      margin-top: 14px;
      margin-bottom: 12px;
    }

    button.btn-primary {
      flex: 1;
      background-color: var(--vscode-button-background, #007acc);
      color: var(--vscode-button-foreground, #fff);
      border: none;
      border-radius: var(--radius-sm);
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    button.btn-primary:hover {
      background-color: var(--vscode-button-hoverBackground, #0062a3);
    }

    button.btn-secondary {
      background-color: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #fff);
      border: none;
      border-radius: var(--radius-sm);
      padding: 7px 10px;
      font-size: 12px;
      cursor: pointer;
      transition: var(--transition);
    }

    button.btn-secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
    }

    /* Diagnostics Banner */
    .status-banner {
      display: none;
      padding: 6px 8px;
      font-size: 11px;
      border-radius: var(--radius-sm);
      margin-top: 10px;
      word-break: break-word;
    }

    .status-banner.success {
      display: block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
    }

    .status-banner.error {
      display: block;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
    }

    .status-banner.testing {
      display: block;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #60a5fa;
    }

    .status-banner.info {
      display: block;
      background: rgba(147, 51, 234, 0.15);
      border: 1px solid rgba(147, 51, 234, 0.4);
      color: #c084fc;
    }

    /* Quick Trigger Box */
    .quick-trigger-card {
      margin-top: 16px;
      padding: 10px;
      border-radius: var(--radius-md);
      background: var(--vscode-editor-background);
      border: 1px dashed var(--vscode-input-border, rgba(128, 128, 128, 0.25));
    }

    .shortcut-hint {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    kbd {
      background: var(--vscode-keybindingLabel-background, rgba(128, 128, 128, 0.2));
      border: 1px solid var(--vscode-keybindingLabel-border, rgba(128, 128, 128, 0.4));
      border-radius: 3px;
      padding: 1px 4px;
      font-family: inherit;
      font-size: 10px;
      color: var(--vscode-keybindingLabel-foreground, #fff);
    }
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
    const vscode = acquireVsCodeApi();

    let currentProvider = 'internal';

    function selectProvider(prov) {
      currentProvider = prov;
      document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('active'));
      const activeCard = document.getElementById('card-' + prov);
      if (activeCard) activeCard.classList.add('active');

      const radio = document.getElementById('radio-' + prov);
      if (radio) radio.checked = true;

      // Toggle dynamic input sections
      document.getElementById('section-gemini').style.display = prov === 'gemini' ? 'block' : 'none';
      document.getElementById('section-openai').style.display = prov === 'openai_compatible' ? 'block' : 'none';
    }

    function updateSliderVal(val) {
      document.getElementById('maxFilesVal').innerText = val;
    }

    function togglePass(inputId) {
      const el = document.getElementById(inputId);
      if (el) {
        el.type = el.type === 'password' ? 'text' : 'password';
      }
    }

    function gatherPayload() {
      return {
        provider: currentProvider,
        geminiApiKey: document.getElementById('geminiApiKey').value.trim(),
        geminiModel: document.getElementById('geminiModel').value.trim() || 'gemini-2.5-flash',
        openaiBaseUrl: document.getElementById('openaiBaseUrl').value.trim() || 'https://api.openai.com/v1',
        openaiApiKey: document.getElementById('openaiApiKey').value.trim(),
        openaiModel: document.getElementById('openaiModel').value.trim() || 'gpt-4o-mini',
        maxContextFiles: parseInt(document.getElementById('maxContextFiles').value, 10) || 3
      };
    }

    function saveSettings() {
      const payload = gatherPayload();
      vscode.postMessage({ type: 'saveSettings', payload });
    }

    function testConnection() {
      const payload = gatherPayload();
      vscode.postMessage({ type: 'testConnection', payload });
    }

    function runEnhancement() {
      vscode.postMessage({ type: 'triggerEnhance' });
    }

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'loadConfig') {
        const cfg = msg.config;
        selectProvider(cfg.provider || 'internal');
        document.getElementById('geminiApiKey').value = cfg.geminiApiKey || '';
        document.getElementById('geminiModel').value = cfg.geminiModel || 'gemini-2.5-flash';
        document.getElementById('openaiBaseUrl').value = cfg.openaiBaseUrl || 'https://api.openai.com/v1';
        document.getElementById('openaiApiKey').value = cfg.openaiApiKey || '';
        document.getElementById('openaiModel').value = cfg.openaiModel || 'gpt-4o-mini';
        document.getElementById('maxContextFiles').value = cfg.maxContextFiles || 3;
        updateSliderVal(cfg.maxContextFiles || 3);
      } else if (msg.type === 'statusMessage') {
        const banner = document.getElementById('statusBanner');
        banner.className = 'status-banner ' + msg.status;
        banner.innerText = msg.text;
        setTimeout(() => { banner.style.display = 'none'; }, 4000);
      } else if (msg.type === 'testStatus') {
        const banner = document.getElementById('statusBanner');
        banner.className = 'status-banner ' + msg.status;
        banner.innerText = msg.text;
      }
    });
  </script>
</body>
</html>`;
    }
}
exports.SettingsWebviewProvider = SettingsWebviewProvider;
//# sourceMappingURL=settingsWebviewProvider.js.map