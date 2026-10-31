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
exports.InternalLlmService = void 0;
const vscode = __importStar(require("vscode"));
class InternalLlmService {
    /**
     * Request completion from VS Code Language Model API (vscode.lm).
     * Prioritizes 'antigravity' vendor, followed by other available providers (copilot, etc.).
     */
    async generate(systemPrompt, userPrompt, cancellationToken) {
        const model = await this.selectOptimalModel();
        if (!model) {
            throw new Error('No Language Model found in VS Code. Please ensure an AI provider (Antigravity or GitHub Copilot) is enabled, or switch antigravityEnhancer.provider to "openai_compatible" in settings.');
        }
        // Combine system prompt and user prompt into a single structured prompt for universal provider compatibility
        const promptContent = systemPrompt
            ? `System Instructions:\n${systemPrompt}\n\n---\n\nUser Request:\n${userPrompt}`
            : userPrompt;
        const messages = [vscode.LanguageModelChatMessage.User(promptContent)];
        try {
            const response = await model.sendRequest(messages, {}, cancellationToken ?? new vscode.CancellationTokenSource().token);
            let aggregatedResult = '';
            for await (const fragment of response.text) {
                aggregatedResult += fragment;
            }
            return aggregatedResult.trim();
        }
        catch (err) {
            if (err instanceof vscode.CancellationError) {
                throw err;
            }
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(`vscode.lm generation failed [${model.name || model.id}]: ${errorMessage}`);
        }
    }
    async selectOptimalModel() {
        // 1. Try vendor: 'antigravity'
        try {
            const antigravityModels = await vscode.lm.selectChatModels({ vendor: 'antigravity' });
            if (antigravityModels && antigravityModels.length > 0) {
                return antigravityModels[0];
            }
        }
        catch {
            // Continue to next selector
        }
        // 2. Try vendor: 'copilot'
        try {
            const copilotModels = await vscode.lm.selectChatModels({ vendor: 'copilot' });
            if (copilotModels && copilotModels.length > 0) {
                return copilotModels[0];
            }
        }
        catch {
            // Continue to next selector
        }
        // 3. Fallback to any registered chat model in the environment
        try {
            const allModels = await vscode.lm.selectChatModels();
            if (allModels && allModels.length > 0) {
                return allModels[0];
            }
        }
        catch {
            // No models found
        }
        return undefined;
    }
}
exports.InternalLlmService = InternalLlmService;
//# sourceMappingURL=internalLlmService.js.map