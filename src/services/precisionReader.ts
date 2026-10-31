import * as vscode from 'vscode';
import * as path from 'path';

export interface FileSnippet {
  relativePath: string;
  content: string;
  totalLines: number;
  truncated: boolean;
  language: string;
}

export interface ActiveSelectionContext {
  relativePath: string;
  language: string;
  startLine: number;
  endLine: number;
  selectedText: string;
}

export interface PrecisionContext {
  activeSelection?: ActiveSelectionContext;
  files: FileSnippet[];
}

export class PrecisionReader {
  private static readonly MAX_LINES_CEILING = 200;

  /**
   * Captures highlighted text in the active editor as highest-priority primary context,
   * and slices designated files with a safe line ceiling.
   */
  public async readPrecisionContext(filePaths: string[]): Promise<PrecisionContext> {
    const activeSelection = this.captureActiveEditorSelection();
    const files: FileSnippet[] = [];

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

        let snippetContent: string;
        let truncated = false;

        if (totalLines > PrecisionReader.MAX_LINES_CEILING) {
          truncated = true;
          const sliced = lines.slice(0, PrecisionReader.MAX_LINES_CEILING);
          snippetContent =
            sliced.join('\n') +
            `\n\n/* ... [Truncated: File contains ${totalLines} total lines; first ${PrecisionReader.MAX_LINES_CEILING} lines retained for precision context] ... */`;
        } else {
          snippetContent = fullContent;
        }

        files.push({
          relativePath: relPath,
          content: snippetContent,
          totalLines,
          truncated,
          language
        });
      } catch (err) {
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
  public captureActiveEditorSelection(): ActiveSelectionContext | undefined {
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

  public inferLanguage(filePath: string): string {
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

