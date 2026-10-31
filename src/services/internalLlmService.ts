import * as vscode from 'vscode';

export class InternalLlmService {
  /**
   * Request completion from VS Code Language Model API (vscode.lm).
   * Prioritizes 'antigravity' vendor, followed by other available providers (copilot, etc.).
   */
  public async generate(
    systemPrompt: string,
    userPrompt: string,
    cancellationToken?: vscode.CancellationToken
  ): Promise<string> {
    const model = await this.selectOptimalModel();
    if (!model) {
      throw new Error(
        'No Language Model found in VS Code. Please ensure an AI provider (Antigravity or GitHub Copilot) is enabled, or switch antigravityEnhancer.provider to "openai_compatible" in settings.'
      );
    }

    // Combine system prompt and user prompt into a single structured prompt for universal provider compatibility
    const promptContent = systemPrompt
      ? `System Instructions:\n${systemPrompt}\n\n---\n\nUser Request:\n${userPrompt}`
      : userPrompt;

    const messages = [vscode.LanguageModelChatMessage.User(promptContent)];

    try {
      const response = await model.sendRequest(
        messages,
        {},
        cancellationToken ?? new vscode.CancellationTokenSource().token
      );

      let aggregatedResult = '';
      for await (const fragment of response.text) {
        aggregatedResult += fragment;
      }

      return aggregatedResult.trim();
    } catch (err: unknown) {
      if (err instanceof vscode.CancellationError) {
        throw err;
      }
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(`vscode.lm generation failed [${model.name || model.id}]: ${errorMessage}`);
    }
  }

  private async selectOptimalModel(): Promise<vscode.LanguageModelChat | undefined> {
    // 1. Try vendor: 'antigravity'
    try {
      const antigravityModels = await vscode.lm.selectChatModels({ vendor: 'antigravity' });
      if (antigravityModels && antigravityModels.length > 0) {
        return antigravityModels[0];
      }
    } catch {
      // Continue to next selector
    }

    // 2. Try vendor: 'copilot'
    try {
      const copilotModels = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      if (copilotModels && copilotModels.length > 0) {
        return copilotModels[0];
      }
    } catch {
      // Continue to next selector
    }

    // 3. Fallback to any registered chat model in the environment
    try {
      const allModels = await vscode.lm.selectChatModels();
      if (allModels && allModels.length > 0) {
        return allModels[0];
      }
    } catch {
      // No models found
    }

    return undefined;
  }
}

