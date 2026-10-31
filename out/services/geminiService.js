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
exports.GeminiService = void 0;
const vscode = __importStar(require("vscode"));
class GeminiService {
    /**
     * Calls Google Gemini API directly using official generativelanguage REST endpoint.
     */
    async generate(config, systemInstruction, userPrompt, cancellationToken) {
        const apiKey = config.geminiApiKey;
        if (!apiKey) {
            throw new Error('Google Gemini API key is missing. Please set antigravityEnhancer.geminiApiKey in settings.');
        }
        const model = config.geminiModel || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
        const body = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userPrompt }]
                }
            ],
            generationConfig: {
                temperature: 0.2
            }
        };
        if (systemInstruction && systemInstruction.trim().length > 0) {
            body.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                signal: abortController.signal
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error (${response.status}): ${errorText}`);
            }
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text || typeof text !== 'string') {
                throw new Error('Received empty response from Gemini API.');
            }
            return text.trim();
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
exports.GeminiService = GeminiService;
//# sourceMappingURL=geminiService.js.map