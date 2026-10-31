import * as vscode from 'vscode';
import { ExtensionConfig } from '../config/settings';

export class OpenRouterService {
  private static readonly ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

  /**
   * Calls OpenRouter chat completions endpoint with model, context headers, and cancellation support.
   */
  public async generate(
    config: ExtensionConfig,
    systemInstruction: string,
    userPrompt: string,
    cancellationToken?: vscode.CancellationToken
  ): Promise<string> {
    const apiKey = config.openrouterApiKey;
    if (!apiKey) {
      throw new Error('OpenRouter API key is missing. Please set antigravityEnhancer.openrouterApiKey in settings.');
    }

    const abortController = new AbortController();
    let disposable: vscode.Disposable | undefined;

    if (cancellationToken) {
      if (cancellationToken.isCancellationRequested) {
        throw new vscode.CancellationError();
      }
      disposable = cancellationToken.onCancellationRequested(() => {
        abortController.abort();
      });
    }

    const messages = [];
    if (systemInstruction && systemInstruction.trim().length > 0) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: userPrompt });

    const payload = {
      model: config.openrouterModel || 'anthropic/claude-3.5-sonnet',
      messages,
      temperature: 0.2
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/ahmedshaban-blip/antigravity-prompt-enhancer',
      'X-Title': 'Antigravity Prompt Enhancer'
    };

    try {
      const response = await fetch(OpenRouterService.ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: abortController.signal
      });

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorJson: any = await response.json();
          errorDetail = errorJson?.error?.message || errorJson?.message || JSON.stringify(errorJson);
        } catch {
          errorDetail = await response.text();
        }
        throw new Error(`OpenRouter API error (${response.status} ${response.statusText}): ${errorDetail}`);
      }

      const json: any = await response.json();
      const content = json?.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new Error('Received empty completion content from OpenRouter provider.');
      }

      return content.trim();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new vscode.CancellationError();
      }
      throw err;
    } finally {
      disposable?.dispose();
    }
  }
}
