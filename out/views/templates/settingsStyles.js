"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsStyles = getSettingsStyles;
/**
 * Anti-AI-slop design system styles for the Settings Webview
 */
function getSettingsStyles() {
    return `
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
  `;
}
//# sourceMappingURL=settingsStyles.js.map