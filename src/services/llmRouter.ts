import * as vscode from 'vscode';
import { getExtensionConfig, validateConfig } from '../config/settings';
import { InternalLlmService } from './internalLlmService';
import { OpenAiService } from './openAiService';

export class LlmRouter {
  private readonly internalService: InternalLlmService;
  private readonly openAiService: OpenAiService;

  constructor() {
    this.internalService = new InternalLlmService();
    this.openAiService = new OpenAiService();
  }

  /**
   * Routes the prompt to the configured provider (internal vscode.lm or OpenAI-compatible REST API).
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

    if (config.provider === 'openai_compatible') {
      return await this.openAiService.generate(config, systemPrompt, userPrompt, cancellationToken);
    }

    // Default: internal vscode.lm
    return await this.internalService.generate(systemPrompt, userPrompt, cancellationToken);
  }
}

