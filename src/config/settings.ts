import * as vscode from 'vscode';

export type EnhancerProvider = 'internal' | 'openai_compatible';

export interface ExtensionConfig {
  provider: EnhancerProvider;
  openaiBaseUrl: string;
  openaiApiKey: string;
  openaiModel: string;
  maxContextFiles: number;
}

export const CONFIG_SECTION = 'antigravityEnhancer';

export function getExtensionConfig(): ExtensionConfig {
  const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);

  const provider = configuration.get<EnhancerProvider>('provider', 'internal');
  const openaiBaseUrl = configuration.get<string>('openaiBaseUrl', 'https://api.openai.com/v1').trim();
  const openaiApiKey = configuration.get<string>('openaiApiKey', '').trim();
  const openaiModel = configuration.get<string>('openaiModel', 'gpt-4o-mini').trim();
  const maxContextFiles = configuration.get<number>('maxContextFiles', 3);

  return {
    provider,
    openaiBaseUrl,
    openaiApiKey,
    openaiModel,
    maxContextFiles: Math.max(1, Math.min(maxContextFiles, 10))
  };
}

export function validateConfig(config: ExtensionConfig): { valid: boolean; message?: string } {
  if (config.provider === 'openai_compatible') {
    if (!config.openaiBaseUrl) {
      return {
        valid: false,
        message: 'OpenAI Base URL is empty. Please set antigravityEnhancer.openaiBaseUrl in VS Code settings.'
      };
    }

    if (!config.openaiModel) {
      return {
        valid: false,
        message: 'OpenAI Model is empty. Please specify a model (e.g. gpt-4o-mini, llama3) in settings.'
      };
    }
  }

  return { valid: true };
}

