import * as vscode from 'vscode';

export type EnhancerProvider = 'openrouter' | 'gemini' | 'openai_compatible';

export interface ExtensionConfig {
  provider: EnhancerProvider;
  openrouterApiKey: string;
  openrouterModel: string;
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

  const provider = configuration.get<EnhancerProvider>('provider', 'openrouter');
  const openrouterApiKey = configuration.get<string>('openrouterApiKey', '').trim();
  const openrouterModel = configuration.get<string>('openrouterModel', 'anthropic/claude-3.5-sonnet').trim();
  const geminiApiKey = configuration.get<string>('geminiApiKey', '').trim();
  const geminiModel = configuration.get<string>('geminiModel', 'gemini-2.5-flash').trim();
  const openaiBaseUrl = configuration.get<string>('openaiBaseUrl', 'https://api.openai.com/v1').trim();
  const openaiApiKey = configuration.get<string>('openaiApiKey', '').trim();
  const openaiModel = configuration.get<string>('openaiModel', 'gpt-4o-mini').trim();
  const maxContextFiles = configuration.get<number>('maxContextFiles', 3);

  return {
    provider,
    openrouterApiKey,
    openrouterModel,
    geminiApiKey,
    geminiModel,
    openaiBaseUrl,
    openaiApiKey,
    openaiModel,
    maxContextFiles: Math.max(1, Math.min(maxContextFiles, 10))
  };
}

export function validateConfig(config: ExtensionConfig): { valid: boolean; message?: string } {
  if (config.provider === 'openrouter') {
    if (!config.openrouterApiKey) {
      return {
        valid: false,
        message: 'OpenRouter API key is missing. Please set antigravityEnhancer.openrouterApiKey in settings.'
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

  if (config.provider === 'openai_compatible') {
    if (!config.openaiBaseUrl) {
      return {
        valid: false,
        message: 'OpenAI Base URL is empty. Please set antigravityEnhancer.openaiBaseUrl in settings.'
      };
    }
  }

  return { valid: true };
}
