import * as vscode from 'vscode';
import { LlmRouter } from './llmRouter';
import { DetectedStack } from '../context/stackDetector';
import { PrecisionContext } from './precisionReader';

export class PromptSynthesizer {
  constructor(private readonly llmRouter: LlmRouter) {}

  /**
   * Stage 2: Synthesizes an authoritative master prompt combining the user's raw draft,
   * detected stack, and precision code snippets.
   */
  public async synthesize(
    rawDraft: string,
    stack: DetectedStack,
    precision: PrecisionContext,
    cancellationToken?: vscode.CancellationToken
  ): Promise<string> {
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

    const contextSections: string[] = [];

    // 1. Active Editor Highlight (Highest Priority Primary Context)
    if (precision.activeSelection) {
      const sel = precision.activeSelection;
      contextSections.push(
        `### PRIMARY FOCUSED CONTEXT (Active Editor Selection: ${sel.relativePath} Lines ${sel.startLine}-${sel.endLine})
\`\`\`${sel.language}
${sel.selectedText}
\`\`\``
      );
    }

    // 2. Sliced Files from Stage 1
    if (precision.files.length > 0) {
      contextSections.push('### SCOUTED WORKSPACE CODE SLICES');
      for (const file of precision.files) {
        contextSections.push(
          `File: \`${file.relativePath}\` (${file.totalLines} lines${file.truncated ? ', first 200 lines' : ''})
\`\`\`${file.language}
${file.content}
\`\`\``
        );
      }
    }

    const assembledContext = contextSections.length > 0
      ? contextSections.join('\n\n')
      : 'No specific workspace code files retrieved; rely on project stack conventions.';

    const userPrompt = `--- DEVELOPER ORIGINAL DRAFT ---
${rawDraft}

--- DETECTED PROJECT STACK ---
${stack.summary}

--- WORKSPACE CONTEXT & SURGICAL SNIPPETS ---
${assembledContext}

Generate the authoritative, unambiguous master prompt now:`;

    const synthesizedPrompt = await this.llmRouter.generate(
      systemPrompt,
      userPrompt,
      cancellationToken
    );

    return synthesizedPrompt.trim();
  }
}

