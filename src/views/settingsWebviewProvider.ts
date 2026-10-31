import * as vscode from 'vscode';
import { getExtensionConfig, CONFIG_SECTION, ExtensionConfig } from '../config/settings';
import { LlmRouter } from '../services/llmRouter';
import { getSettingsHtml } from './templates/settingsHtml';

export class SettingsWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'antigravityEnhancer.settingsView';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _llmRouter: LlmRouter
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = getSettingsHtml();

    // Initial state dispatch
    this.sendCurrentConfig();

    // Handle incoming messages from the Webview script
    webviewView.webview.onDidReceiveMessage(async (message: any) => {
      switch (message.type) {
        case 'saveSettings': {
          await this.handleSaveSettings(message.payload);
          break;
        }
        case 'testConnection': {
          await this.handleTestConnection();
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
      if (e.affectsConfiguration(CONFIG_SECTION)) {
        this.sendCurrentConfig();
      }
    });
  }

  public sendCurrentConfig(): void {
    if (!this._view) return;
    const config = getExtensionConfig();
    this._view.webview.postMessage({
      type: 'loadConfig',
      config
    });
  }

  private async handleSaveSettings(payload: ExtensionConfig): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    try {
      await config.update('provider', payload.provider, vscode.ConfigurationTarget.Global);
      await config.update('openrouterApiKey', payload.openrouterApiKey, vscode.ConfigurationTarget.Global);
      await config.update('openrouterModel', payload.openrouterModel, vscode.ConfigurationTarget.Global);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this._view?.webview.postMessage({
        type: 'statusMessage',
        status: 'error',
        text: `Failed to save: ${msg}`
      });
    }
  }

  private async handleTestConnection(): Promise<void> {
    const startTime = Date.now();
    this._view?.webview.postMessage({
      type: 'testStatus',
      status: 'testing',
      text: 'Testing connection...'
    });

    try {
      const result = await this._llmRouter.generate(
        'You are a connectivity test.',
        'Reply with the single word: OK'
      );

      const latency = Date.now() - startTime;
      this._view?.webview.postMessage({
        type: 'testStatus',
        status: 'success',
        text: `Success: "${result.slice(0, 30)}" (${latency}ms)`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this._view?.webview.postMessage({
        type: 'testStatus',
        status: 'error',
        text: `Connection failed: ${msg}`
      });
    }
  }
}
