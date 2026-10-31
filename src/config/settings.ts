import * as vscode from 'vscode';

export type EnhancerProvider = 'internal' | 'gemini' | 'openai_compatible';

export interface ExtensionConfig {
  provider: EnhancerProvider;
  geminiApiKey: string;
  geminiModel: string;
  openaiBaseUrl: string;
  openaiApiKey: string;
  openaiModel: string;
  maxContextFiles: number;
}

export const CONFIG_SECTION = 'antigravityEnhancer';

export function getExtensionConfig(): ExtensionConfig {
  const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);

  const provider = configuration.get<EnhancerProvider>('provider', 'internal');
  const geminiApiKey = configuration.get<string>('geminiApiKey', '').trim();
  const geminiModel = configuration.get<string>('geminiModel', 'gemini-2.5-flash').trim();
  const openaiBaseUrl = configuration.get<string>('openaiBaseUrl', 'https://api.openai.com/v1').trim();
  const openaiApiKey = configuration.get<string>('openaiApiKey', '').trim();
  const openaiModel = configuration.get<string>('openaiModel', 'gpt-4o-mini').trim();
  const maxContextFiles = configuration.get<number>('maxContextFiles', 3);

  return {
    provider,
    geminiApiKey,
    geminiModel,
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
        message: 'OpenAI Base URL is empty. Please set antigravityEnhancer.openaiBaseUrl in settings.'
      };
    }
  }

  if (config.provider === 'gemini') {
    if (!config.geminiApiKey) {
      return {
        valid: false,
        message: 'Google Gemini API key is missing. Please set antigravityEnhancer.geminiApiKey in settings.'
      };
    }
  }

  return { valid: true };
}
