import * as vscode from 'vscode';
import { getExtensionConfig, validateConfig } from '../config/settings';
import { OpenRouterService } from './openRouterService';
import { GeminiService } from './geminiService';
import { OpenAiService } from './openAiService';

export class NoLanguageModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoLanguageModelError';
  }
}

export class LlmRouter {
  private readonly openRouterService: OpenRouterService;
  private readonly geminiService: GeminiService;
  private readonly openAiService: OpenAiService;

  constructor() {
    this.openRouterService = new OpenRouterService();
    this.geminiService = new GeminiService();
    this.openAiService = new OpenAiService();
  }

  /**
   * Routes the prompt to the configured provider (openrouter, gemini, or openai_compatible).
   */
  public async generate(
    systemPrompt: string,
    userPrompt: string,
    cancellationToken?: vscode.CancellationToken
  ): Promise<string> {
    const config = getExtensionConfig();
    const validation = validateConfig(config);

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
