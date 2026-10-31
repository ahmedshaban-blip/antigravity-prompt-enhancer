import * as path from 'path';

/**
 * Utility to map file extensions to Markdown / VS Code syntax highlight identifiers.
 */
export function inferLanguage(filePath: string): string {
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
