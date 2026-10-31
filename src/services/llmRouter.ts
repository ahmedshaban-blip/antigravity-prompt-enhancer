import * as vscode from 'vscode';
import { getExtensionConfig, validateConfig } from '../config/settings';
import { InternalLlmService } from './internalLlmService';
import { OpenAiService } from './openAiService';
import { GeminiService } from './geminiService';

export class NoLanguageModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoLanguageModelError';
  }
}

export class LlmRouter {
  private readonly internalService: InternalLlmService;
  private readonly openAiService: OpenAiService;
  private readonly geminiService: GeminiService;

  constructor() {
    this.internalService = new InternalLlmService();
    this.openAiService = new OpenAiService();
    this.geminiService = new GeminiService();
  }

  /**
   * Routes the prompt to the configured provider (gemini, openai_compatible, or internal vscode.lm).
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
      } catch (geminiErr) {
        console.warn('[LlmRouter] Gemini fallback failed, attempting vscode.lm:', geminiErr);
      }
    }

    // Try vscode.lm
    try {
      return await this.internalService.generate(systemPrompt, userPrompt, cancellationToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('No Language Model found in VS Code')) {
        throw new NoLanguageModelError(msg);
      }
      throw err;
    }
  }
}
