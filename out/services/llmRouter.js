"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmRouter = exports.NoLanguageModelError = void 0;
const settings_1 = require("../config/settings");
const openRouterService_1 = require("./openRouterService");
const geminiService_1 = require("./geminiService");
const openAiService_1 = require("./openAiService");
class NoLanguageModelError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoLanguageModelError';
    }
}
exports.NoLanguageModelError = NoLanguageModelError;
class LlmRouter {
    openRouterService;
    geminiService;
    openAiService;
    constructor() {
        this.openRouterService = new openRouterService_1.OpenRouterService();
        this.geminiService = new geminiService_1.GeminiService();
        this.openAiService = new openAiService_1.OpenAiService();
    }
    /**
     * Routes the prompt to the configured provider (openrouter, gemini, or openai_compatible).
     */
    async generate(systemPrompt, userPrompt, cancellationToken) {
        const config = (0, settings_1.getExtensionConfig)();
        const validation = (0, settings_1.validateConfig)(config);
        if (!validation.valid) {
            throw new Error(`Configuration Error: ${validation.message}`);
        }
        if (config.provider === 'openrouter') {
            return await this.openRouterService.generate(config, systemPrompt, userPrompt, cancellationToken);
        }
        if (config.provider === 'gemini') {
            return await this.geminiService.generate(config, systemPrompt, userPrompt, cancellationToken);
        }
        if (config.provider === 'openai_compatible') {
            return await this.openAiService.generate(config, systemPrompt, userPrompt, cancellationToken);
        }
        throw new NoLanguageModelError('No active AI provider configured.');
    }
}
exports.LlmRouter = LlmRouter;
//# sourceMappingURL=llmRouter.js.map