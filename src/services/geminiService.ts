import * as vscode from 'vscode';
import { ExtensionConfig } from '../config/settings';

export class GeminiService {
  /**
   * Calls Google Gemini API directly using official generativelanguage REST endpoint.
   */
  public async generate(
    config: ExtensionConfig,
    systemInstruction: string,
    userPrompt: string,
    cancellationToken?: vscode.CancellationToken
  ): Promise<string> {
    const apiKey = config.geminiApiKey;
    if (!apiKey) {
      throw new Error('Google Gemini API key is missing. Please set antigravityEnhancer.geminiApiKey in settings.');
    }

    const model = config.geminiModel || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

    const body: Record<string, any> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    };

    if (systemInstruction && systemInstruction.trim().length > 0) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data: any = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || typeof text !== 'string') {
        throw new Error('Received empty response from Gemini API.');
      }

      return text.trim();
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
