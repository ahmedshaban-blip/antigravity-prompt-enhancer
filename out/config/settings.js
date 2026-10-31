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
exports.CONFIG_SECTION = void 0;
exports.getExtensionConfig = getExtensionConfig;
exports.validateConfig = validateConfig;
const vscode = __importStar(require("vscode"));
exports.CONFIG_SECTION = 'antigravityEnhancer';
function getExtensionConfig() {
    const configuration = vscode.workspace.getConfiguration(exports.CONFIG_SECTION);
    const provider = configuration.get('provider', 'internal');
    const geminiApiKey = configuration.get('geminiApiKey', '').trim();
    const geminiModel = configuration.get('geminiModel', 'gemini-2.5-flash').trim();
    const openaiBaseUrl = configuration.get('openaiBaseUrl', 'https://api.openai.com/v1').trim();
    const openaiApiKey = configuration.get('openaiApiKey', '').trim();
    const openaiModel = configuration.get('openaiModel', 'gpt-4o-mini').trim();
    const maxContextFiles = configuration.get('maxContextFiles', 3);
    return {
        provider,
        geminiApiKey,
        geminiModel,
        openaiBaseUrl,
        openaiApiKey,
        openaiModel,
        maxContextFiles: Math.max(1, Math.min(maxContextFiles, 10))
    };
}
function validateConfig(config) {
    if (config.provider === 'openai_compatible') {
        if (!config.openaiBaseUrl) {
            return {
                valid: false,
                message: 'OpenAI Base URL is empty. Please set antigravityEnhancer.openaiBaseUrl in settings.'
            };
        }
    }
    if (config.provider === 'gemini') {
        if (!config.geminiApiKey) {
            return {
                valid: false,
                message: 'Google Gemini API key is missing. Please set antigravityEnhancer.geminiApiKey in settings.'
            };
        }
    }
    return { valid: true };
}
//# sourceMappingURL=settings.js.map