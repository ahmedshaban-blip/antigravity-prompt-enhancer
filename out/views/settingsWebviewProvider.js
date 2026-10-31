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
const settingsHtml_1 = require("./templates/settingsHtml");
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
        webviewView.webview.html = (0, settingsHtml_1.getSettingsHtml)();
        // Initial state dispatch
        this.sendCurrentConfig();
        // Handle incoming messages from the Webview script
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
}
exports.SettingsWebviewProvider = SettingsWebviewProvider;
//# sourceMappingURL=settingsWebviewProvider.js.map