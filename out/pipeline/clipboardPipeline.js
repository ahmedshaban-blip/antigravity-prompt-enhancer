"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClipboardPipeline = void 0;
const vscode = __importStar(require("vscode"));
class ClipboardPipeline {
    /**
     * Captures the user's draft from chat input or editor using clipboard copy orchestration.
     * If no text was highlighted, gracefully falls back to an interactive input box.
     */
    async captureDraft() {
        const previousClipboardText = await vscode.env.clipboard.readText();
        // Attempt to copy the currently highlighted text in chat input or editor
        try {
            await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
            // Brief pause to allow OS clipboard event to settle
            await new Promise(resolve => setTimeout(resolve, 60));
        }
        catch (err) {
            console.warn('[ClipboardPipeline] clipboardCopyAction command failed or not supported in current focus:', err);
        }
        const copiedText = (await vscode.env.clipboard.readText()).trim();
        // Check if new content was captured via copy
        if (copiedText && copiedText !== previousClipboardText.trim()) {
            return {
                draft: copiedText,
                previousClipboardText,
                source: 'selection'
            };
        }
        // Secondary check: active text editor selection
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && !activeEditor.selection.isEmpty) {
            const editorSelection = activeEditor.document.getText(activeEditor.selection).trim();
            if (editorSelection) {
                return {
                    draft: editorSelection,
                    previousClipboardText,
                    source: 'selection'
                };
            }
        }
        // Tertiary check: if clipboard already had text that looks like a prompt
        if (copiedText && copiedText.length > 5) {
            return {
                draft: copiedText,
                previousClipboardText,
                source: 'clipboard'
            };
        }
        // Fallback: Prompt user interactively if nothing was highlighted
        const manualDraft = await vscode.window.showInputBox({
            title: 'Antigravity Prompt Enhancer',
            prompt: 'Enter or paste the rough prompt draft to enhance with project context:',
            placeHolder: 'e.g., Implement biometric authentication flow with error fallback'
        });
        if (!manualDraft || !manualDraft.trim()) {
            return null;
        }
        return {
            draft: manualDraft.trim(),
            previousClipboardText,
            source: 'inputBox'
        };
    }
    /**
     * Writes the synthesized master prompt to the clipboard and executes in-place paste.
     */
    async replaceInPlace(synthesizedPrompt) {
        await vscode.env.clipboard.writeText(synthesizedPrompt);
        // Give clipboard a micro-tick to register
        await new Promise(resolve => setTimeout(resolve, 50));
        try {
            await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
        }
        catch (err) {
            console.warn('[ClipboardPipeline] clipboardPasteAction execution failed:', err);
        }
    }
}
exports.ClipboardPipeline = ClipboardPipeline;
//# sourceMappingURL=clipboardPipeline.js.map