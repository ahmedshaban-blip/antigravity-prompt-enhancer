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
exports.OpenRouterService = void 0;
const vscode = __importStar(require("vscode"));
class OpenRouterService {
    static ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
    /**
     * Calls OpenRouter chat completions endpoint with model, context headers, and cancellation support.
     */
    async generate(config, systemInstruction, userPrompt, cancellationToken) {
        const apiKey = config.openrouterApiKey;
        if (!apiKey) {
            throw new Error('OpenRouter API key is missing. Please set antigravityEnhancer.openrouterApiKey in settings.');
        }
        const abortController = new AbortController();
        let disposable;
        if (cancellationToken) {
            if (cancellationToken.isCancellationRequested) {
                throw new vscode.CancellationError();
            }
            disposable = cancellationToken.onCancellationRequested(() => {
                abortController.abort();
            });
        }
        const messages = [];
        if (systemInstruction && systemInstruction.trim().length > 0) {
            messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: userPrompt });
        const payload = {
            model: config.openrouterModel || 'anthropic/claude-3.5-sonnet',
            messages,
            temperature: 0.2
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/ahmedshaban-blip/antigravity-prompt-enhancer',
            'X-Title': 'Antigravity Prompt Enhancer'
        };
        try {
            const response = await fetch(OpenRouterService.ENDPOINT, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                signal: abortController.signal
            });
            if (!response.ok) {
                let errorDetail = '';
                try {
                    const errorJson = await response.json();
                    errorDetail = errorJson?.error?.message || errorJson?.message || JSON.stringify(errorJson);
                }
                catch {
                    errorDetail = await response.text();
                }
                throw new Error(`OpenRouter API error (${response.status} ${response.statusText}): ${errorDetail}`);
            }
            const json = await response.json();
            const content = json?.choices?.[0]?.message?.content;
            if (!content || typeof content !== 'string') {
                throw new Error('Received empty completion content from OpenRouter provider.');
            }
            return content.trim();
        }
        catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                throw new vscode.CancellationError();
            }
            throw err;
        }
        finally {
            disposable?.dispose();
        }
    }
}
exports.OpenRouterService = OpenRouterService;
//# sourceMappingURL=openRouterService.js.map