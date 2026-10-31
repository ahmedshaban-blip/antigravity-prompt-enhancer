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
exports.PrecisionReader = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class PrecisionReader {
    static MAX_LINES_CEILING = 200;
    /**
     * Captures highlighted text in the active editor as highest-priority primary context,
     * and slices designated files with a safe line ceiling.
     */
    async readPrecisionContext(filePaths) {
        const activeSelection = this.captureActiveEditorSelection();
        const files = [];
        const rootFolder = vscode.workspace.workspaceFolders?.[0];
        if (!rootFolder) {
            return { activeSelection, files };
        }
        for (const relPath of filePaths) {
            try {
                const fileUri = vscode.Uri.joinPath(rootFolder.uri, relPath);
                const fileBytes = await vscode.workspace.fs.readFile(fileUri);
                const fullContent = new TextDecoder('utf-8').decode(fileBytes);
                const lines = fullContent.split(/\r?\n/);
                const totalLines = lines.length;
                const language = this.inferLanguage(relPath);
                let snippetContent;
                let truncated = false;
                if (totalLines > PrecisionReader.MAX_LINES_CEILING) {
                    truncated = true;
                    const sliced = lines.slice(0, PrecisionReader.MAX_LINES_CEILING);
                    snippetContent =
                        sliced.join('\n') +
                            `\n\n/* ... [Truncated: File contains ${totalLines} total lines; first ${PrecisionReader.MAX_LINES_CEILING} lines retained for precision context] ... */`;
                }
                else {
                    snippetContent = fullContent;
                }
                files.push({
                    relativePath: relPath,
                    content: snippetContent,
                    totalLines,
                    truncated,
                    language
                });
            }
            catch (err) {
                console.warn(`[PrecisionReader] Could not read file ${relPath}:`, err);
            }
        }
        return {
            activeSelection,
            files
        };
    }
    /**
     * Returns active text selection if user has an editor tab focused with selected text.
     */
    captureActiveEditorSelection() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.selection.isEmpty) {
            return undefined;
        }
        const doc = activeEditor.document;
        const selectedText = doc.getText(activeEditor.selection).trim();
        if (!selectedText) {
            return undefined;
        }
        return {
            relativePath: vscode.workspace.asRelativePath(doc.uri),
            language: doc.languageId || this.inferLanguage(doc.fileName),
            startLine: activeEditor.selection.start.line + 1,
            endLine: activeEditor.selection.end.line + 1,
            selectedText
        };
    }
    inferLanguage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.ts':
                return 'typescript';
            case '.tsx':
                return 'tsx';
            case '.js':
            case '.mjs':
            case '.cjs':
                return 'javascript';
            case '.jsx':
                return 'jsx';
            case '.dart':
                return 'dart';
            case '.cs':
                return 'csharp';
            case '.py':
                return 'python';
            case '.rs':
                return 'rust';
            case '.go':
                return 'go';
            case '.json':
                return 'json';
            case '.html':
                return 'html';
            case '.css':
            case '.scss':
                return 'css';
            case '.yaml':
            case '.yml':
                return 'yaml';
            case '.md':
                return 'markdown';
            default:
                return 'plaintext';
        }
    }
}
exports.PrecisionReader = PrecisionReader;
//# sourceMappingURL=precisionReader.js.map