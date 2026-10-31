import * as vscode from 'vscode';
import { LlmRouter, NoLanguageModelError } from './llmRouter';
import { DetectedStack } from '../context/stackDetector';
import { PrecisionContext } from './precisionReader';
import { PromptTemplateBuilder } from './promptTemplateBuilder';

export class PromptSynthesizer {
  constructor(private readonly llmRouter: LlmRouter) {}

  /**
   * Stage 2: Synthesizes an authoritative master prompt.
   * If no LLM provider is active in the environment, gracefully generates a high-context
   * master template so Antigravity's chat model (e.g. Gemini 3.8 Flash) can execute it directly.
   */
  public async synthesize(
    rawDraft: string,
    stack: DetectedStack,
    precision: PrecisionContext,
    cancellationToken?: vscode.CancellationToken
  ): Promise<{ prompt: string; mode: 'llm_synthesized' | 'context_template' }> {
    const systemPrompt = `You are an elite Principal Software Architect and Master Prompt Engineer.
Your mission: Transform a developer's rough prompt draft into an authoritative, unambiguous, and surgical master prompt that directs an AI coding agent to implement the solution flawlessly.

Follow this strict output structure:
# [Clear, Action-Oriented Objective]
## Context & Architecture
(Specify detected technology stack: ${stack.summary}, conventions, and target patterns)

## Relevant Files & Targeted Locations
(Specify exact files, classes, methods, or components to modify or create)

## Detailed Implementation Directives
(Step-by-step requirements, architecture adherence, state flow, error handling, and edge cases)

## Verification & Testing
(Specific unit/widget/integration tests or validation steps to ensure zero regressions)

OUTPUT RULES:
- Output ONLY the synthesized master prompt in clean markdown.
- Do NOT output introductory greetings, conversational framing, or meta-comments like "Here is your enhanced prompt".
- Preserve the user's core intent while eliminating ambiguity.`;

    const assembledContext = PromptTemplateBuilder.assembleLlmContext(precision);

    const userPrompt = `--- DEVELOPER ORIGINAL DRAFT ---
${rawDraft}

--- DETECTED PROJECT STACK ---
${stack.summary}

--- WORKSPACE CONTEXT & SURGICAL SNIPPETS ---
${assembledContext}

Generate the authoritative, unambiguous master prompt now:`;

    try {
      const synthesizedPrompt = await this.llmRouter.generate(
        systemPrompt,
        userPrompt,
        cancellationToken
      );
      return {
        prompt: synthesizedPrompt.trim(),
        mode: 'llm_synthesized'
      };
    } catch (err: unknown) {
      if (err instanceof NoLanguageModelError) {
        const fallbackPrompt = PromptTemplateBuilder.buildSmartTemplate(rawDraft, stack, precision);
        return {
          prompt: fallbackPrompt,
          mode: 'context_template'
        };
      }
      throw err;
    }
  }
}
