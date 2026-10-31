import * as vscode from 'vscode';
import { ExtensionConfig } from '../config/settings';

export class OpenAiService {
  /**
   * Send chat completion request to standard OpenAI-compatible REST endpoint.
   */
  public async generate(
    config: ExtensionConfig,
    systemPrompt: string,
    userPrompt: string,
    cancellationToken?: vscode.CancellationToken
  ): Promise<string> {
    const endpoint = this.normalizeEndpoint(config.openaiBaseUrl);

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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.openaiApiKey) {
      headers['Authorization'] = `Bearer ${config.openaiApiKey}`;
    }

    const messages = [];
    if (systemPrompt && systemPrompt.trim().length > 0) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });

    const payload = {
      model: config.openaiModel,
      messages,
      temperature: 0.2
    };

    try {
      const response = await fetch(endpoint, {
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
        throw new Error(`OpenAI-compatible API error (${response.status} ${response.statusText}): ${errorDetail}`);
      }

      const json: any = await response.json();
      const content = json?.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new Error('Received empty or malformed completion content from OpenAI-compatible provider.');
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

  private normalizeEndpoint(baseUrl: string): string {
    const trimmed = baseUrl.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('/chat/completions')) {
      return trimmed;
    }
    return `${trimmed}/chat/completions`;
  }
}

