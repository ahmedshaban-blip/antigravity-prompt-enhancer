/**
 * Client-side script powering the Settings Webview interactions and messaging with VS Code
 */
export function getSettingsScript(): string {
  return `
    const vscode = acquireVsCodeApi();
    let currentProvider = 'openrouter';

    function selectProvider(prov) {
      currentProvider = prov;
      document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('active'));
      const activeCard = document.getElementById('card-' + prov);
      if (activeCard) activeCard.classList.add('active');

      const radio = document.getElementById('radio-' + prov);
      if (radio) radio.checked = true;

      // Toggle dynamic input sections
      document.getElementById('section-openrouter').style.display = prov === 'openrouter' ? 'block' : 'none';
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
        openrouterApiKey: document.getElementById('openrouterApiKey').value.trim(),
        openrouterModel: document.getElementById('openrouterModel').value.trim() || 'anthropic/claude-3.5-sonnet',
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
        selectProvider(cfg.provider || 'openrouter');
        document.getElementById('openrouterApiKey').value = cfg.openrouterApiKey || '';
        document.getElementById('openrouterModel').value = cfg.openrouterModel || 'anthropic/claude-3.5-sonnet';
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
  `;
}
