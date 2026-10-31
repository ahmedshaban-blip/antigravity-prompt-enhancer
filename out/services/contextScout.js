"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextScout = void 0;
class ContextScout {
    llmRouter;
    constructor(llmRouter) {
        this.llmRouter = llmRouter;
    }
    /**
     * Stage 1: Scouts the workspace file map and identifies the top relevant files for the draft.
     */
    async scoutRelevantFiles(draft, activeEditorPath, workspaceFiles, maxFiles = 3, cancellationToken) {
        if (workspaceFiles.length === 0) {
            return [];
        }
        // If workspace is tiny, return up to maxFiles directly
        if (workspaceFiles.length <= maxFiles) {
            return workspaceFiles;
        }
        const systemPrompt = `You are the AI Context Scout for an advanced developer IDE extension.
Your objective: Given a developer's rough prompt draft, the active editor file, and the workspace file list, select ONLY the top 1 to ${maxFiles} files that are most directly relevant to answering or implementing the draft request.

CRITICAL RULES:
1. Output MUST be a strict, valid JSON array of relative file paths from the provided file list.
2. Example output: ["src/services/auth.ts", "src/models/user.ts"]
3. Do NOT include markdown code blocks, explanations, backticks, or conversational commentary.
4. Select ONLY files present in the provided workspace list.`;
        // Limit file list representation to prevent token explosion
        const truncatedFileList = workspaceFiles.slice(0, 300);
        const userPrompt = `Developer Rough Draft:
"${draft}"

Active Editor File:
${activeEditorPath ? activeEditorPath : 'None'}

Workspace Files (${truncatedFileList.length} available):
${truncatedFileList.map(f => `- ${f}`).join('\n')}

Identify top 1 to ${maxFiles} relevant files. Return JSON array ONLY:`;
        try {
            const response = await this.llmRouter.generate(systemPrompt, userPrompt, cancellationToken);
            const parsed = this.parseJsonArray(response);
            // Validate paths exist in workspaceFiles (case-insensitive normalization)
            const workspaceSet = new Map();
            for (const f of workspaceFiles) {
                workspaceSet.set(f.toLowerCase().replace(/\\/g, '/'), f);
            }
            const validatedFiles = [];
            for (const p of parsed) {
                const normalized = p.trim().toLowerCase().replace(/\\/g, '/');
                const original = workspaceSet.get(normalized);
                if (original && !validatedFiles.includes(original)) {
                    validatedFiles.push(original);
                }
                if (validatedFiles.length >= maxFiles) {
                    break;
                }
            }
            if (validatedFiles.length > 0) {
                return validatedFiles;
            }
        }
        catch (err) {
            console.warn('[ContextScout] LLM scouting failed, applying heuristic fallback:', err);
        }
        // Fallback heuristic: Active file + keyword matching
        return this.fallbackHeuristic(draft, activeEditorPath, workspaceFiles, maxFiles);
    }
    parseJsonArray(text) {
        const cleaned = text
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
        const match = cleaned.match(/\[[\s\S]*?\]/);
        if (!match) {
            return [];
        }
        try {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) {
                return parsed.filter(item => typeof item === 'string');
            }
        }
        catch {
            // Failed to parse JSON
        }
        return [];
    }
    fallbackHeuristic(draft, activeEditorPath, workspaceFiles, maxFiles) {
        const selected = [];
        if (activeEditorPath && workspaceFiles.includes(activeEditorPath)) {
            selected.push(activeEditorPath);
        }
        const keywords = draft
            .toLowerCase()
            .split(/[^a-zA-Z0-9_]+/)
            .filter(w => w.length >= 3);
        const scoredFiles = [];
        for (const file of workspaceFiles) {
            if (selected.includes(file))
                continue;
            const lower = file.toLowerCase();
            let score = 0;
            for (const kw of keywords) {
                if (lower.includes(kw)) {
                    score += 1;
                }
            }
            if (score > 0) {
                scoredFiles.push({ file, score });
            }
        }
        scoredFiles.sort((a, b) => b.score - a.score);
        for (const item of scoredFiles) {
            if (selected.length >= maxFiles)
                break;
            selected.push(item.file);
        }
        return selected;
    }
}
exports.ContextScout = ContextScout;
//# sourceMappingURL=contextScout.js.map