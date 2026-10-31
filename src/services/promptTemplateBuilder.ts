import { DetectedStack } from '../context/stackDetector';
import { PrecisionContext } from './precisionReader';

export class PromptTemplateBuilder {
  /**
   * Generates a context-rich, structured master prompt template directly from codebase inspection
   * when no external LLM API key is present.
   */
  public static buildSmartTemplate(
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

  /**
   * Assembles context sections for LLM input prompt.
   */
  public static assembleLlmContext(precision: PrecisionContext): string {
    const contextSections: string[] = [];

    if (precision.activeSelection) {
      const sel = precision.activeSelection;
      contextSections.push(
        `### PRIMARY FOCUSED CONTEXT (Active Editor Selection: ${sel.relativePath} Lines ${sel.startLine}-${sel.endLine})\n\`\`\`${sel.language}\n${sel.selectedText}\n\`\`\``
      );
    }

    if (precision.files.length > 0) {
      contextSections.push('### SCOUTED WORKSPACE CODE SLICES');
      for (const file of precision.files) {
        contextSections.push(
          `File: \`${file.relativePath}\` (${file.totalLines} lines${file.truncated ? ', first 200 lines' : ''})\n\`\`\`${file.language}\n${file.content}\n\`\`\``
        );
      }
    }

    return contextSections.length > 0
      ? contextSections.join('\n\n')
      : 'No specific workspace code files retrieved; rely on project stack conventions.';
  }
}
