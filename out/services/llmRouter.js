"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmRouter = void 0;
const settings_1 = require("../config/settings");
const internalLlmService_1 = require("./internalLlmService");
const openAiService_1 = require("./openAiService");
class LlmRouter {
    internalService;
    openAiService;
    constructor() {
        this.internalService = new internalLlmService_1.InternalLlmService();
        this.openAiService = new openAiService_1.OpenAiService();
    }
    /**
     * Routes the prompt to the configured provider (internal vscode.lm or OpenAI-compatible REST API).
     */
    async generate(systemPrompt, userPrompt, cancellationToken) {
        const config = (0, settings_1.getExtensionConfig)();
        const validation = (0, settings_1.validateConfig)(config);
        if (!validation.valid) {
            throw new Error(`Configuration Error: ${validation.message}`);
        }
        if (config.provider === 'openai_compatible') {
            return await this.openAiService.generate(config, systemPrompt, userPrompt, cancellationToken);
        }
        // Default: internal vscode.lm
        return await this.internalService.generate(systemPrompt, userPrompt, cancellationToken);
    }
}
exports.LlmRouter = LlmRouter;
//# sourceMappingURL=llmRouter.js.map