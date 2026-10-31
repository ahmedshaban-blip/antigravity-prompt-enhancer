"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmRouter = exports.NoLanguageModelError = void 0;
const settings_1 = require("../config/settings");
const internalLlmService_1 = require("./internalLlmService");
const openAiService_1 = require("./openAiService");
const geminiService_1 = require("./geminiService");
class NoLanguageModelError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoLanguageModelError';
    }
}
exports.NoLanguageModelError = NoLanguageModelError;
class LlmRouter {
    internalService;
    openAiService;
    geminiService;
    constructor() {
        this.internalService = new internalLlmService_1.InternalLlmService();
        this.openAiService = new openAiService_1.OpenAiService();
        this.geminiService = new geminiService_1.GeminiService();
    }
    /**
     * Routes the prompt to the configured provider (gemini, openai_compatible, or internal vscode.lm).
     */
    async generate(systemPrompt, userPrompt, cancellationToken) {
        const config = (0, settings_1.getExtensionConfig)();
        const validation = (0, settings_1.validateConfig)(config);
        if (!validation.valid) {
            throw new Error(`Configuration Error: ${validation.message}`);
        }
        if (config.provider === 'gemini') {
            return await this.geminiService.generate(config, systemPrompt, userPrompt, cancellationToken);
        }
        if (config.provider === 'openai_compatible') {
            return await this.openAiService.generate(config, systemPrompt, userPrompt, cancellationToken);
        }
        // Provider is 'internal':
        // If user provided a Gemini key in settings, seamlessly leverage it
        if (config.geminiApiKey) {
            try {
                return await this.geminiService.generate(config, systemPrompt, userPrompt, cancellationToken);
            }
            catch (geminiErr) {
                console.warn('[LlmRouter] Gemini fallback failed, attempting vscode.lm:', geminiErr);
            }
        }
        // Try vscode.lm
        try {
            return await this.internalService.generate(systemPrompt, userPrompt, cancellationToken);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('No Language Model found in VS Code')) {
                throw new NoLanguageModelError(msg);
            }
            throw err;
        }
    }
}
exports.LlmRouter = LlmRouter;
//# sourceMappingURL=llmRouter.js.map