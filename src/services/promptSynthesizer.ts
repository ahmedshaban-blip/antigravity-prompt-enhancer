import * as vscode from 'vscode';
import { LlmRouter, NoLanguageModelError } from './llmRouter';
import { DetectedStack } from '../context/stackDetector';
import { PrecisionContext } from './precisionReader';

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

    const contextSections: string[] = [];

    // 1. Active Editor Highlight (Highest Priority Primary Context)
    if (precision.activeSelection) {
      const sel = precision.activeSelection;
      contextSections.push(
        `### PRIMARY FOCUSED CONTEXT (Active Editor Selection: ${sel.relativePath} Lines ${sel.startLine}-${sel.endLine})\n\`\`\`${sel.language}\n${sel.selectedText}\n\`\`\``
      );
    }

    // 2. Sliced Files from Stage 1
    if (precision.files.length > 0) {
      contextSections.push('### SCOUTED WORKSPACE CODE SLICES');
      for (const file of precision.files) {
        contextSections.push(
          `File: \`${file.relativePath}\` (${file.totalLines} lines${file.truncated ? ', first 200 lines' : ''})\n\`\`\`${file.language}\n${file.content}\n\`\`\``
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
        // Graceful Smart Fallback: generate high-context structured master prompt directly
        const fallbackPrompt = this.synthesizeSmartTemplate(rawDraft, stack, precision);
        return {
          prompt: fallbackPrompt,
          mode: 'context_template'
        };
      }
      throw err;
    }
  }

  /**
   * Generates a context-rich, structured master prompt template directly from codebase inspection
   * when no external LLM API key is present.
   */
  public synthesizeSmartTemplate(
    rawDraft: string,
    stack: DetectedStack,
    precision: PrecisionContext
  ): string {
    const parts: string[] = [];

    parts.push(`# Objective: ${rawDraft}`);
    parts.push('');
    parts.push('## Context & Architecture');
    parts.push(`- **Detected Stack**: ${stack.summary}`);
    parts.push('- **Conventions**: Adhere to project architecture, existing state management, and separation of concerns.');
    parts.push('');

    parts.push('## Targeted Workspace Context');
    if (precision.activeSelection) {
      const sel = precision.activeSelection;
      parts.push(`- **Focused Selection** (\`${sel.relativePath}\` lines ${sel.startLine}–${sel.endLine}):`);
      parts.push(`\`\`\`${sel.language}`);
      parts.push(sel.selectedText);
      parts.push('```');
      parts.push('');
    }

    if (precision.files.length > 0) {
      parts.push('### Relevant Scouted Code Files:');
      for (const f of precision.files) {
        parts.push(`#### \`${f.relativePath}\``);
        parts.push(`\`\`\`${f.language}`);
        parts.push(f.content);
        parts.push('```');
        parts.push('');
      }
    } else {
      parts.push('- Inspect project root and apply changes consistent with codebase structure.');
      parts.push('');
    }

    parts.push('## Implementation Directives');
    parts.push('1. Implement the requested changes addressing the primary objective thoroughly.');
    parts.push('2. Preserve all existing functionality and ensure zero regression in surrounding modules.');
    parts.push('3. Provide clean, documented, and production-ready code with appropriate error handling.');
    parts.push('4. Include verification criteria or tests to validate the solution.');

    return parts.join('\n');
  }
}
