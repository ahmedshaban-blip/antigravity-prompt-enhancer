import * as vscode from 'vscode';
import * as path from 'path';

export class ProjectScanner implements vscode.Disposable {
  private fileCache: string[] | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_TTL_MS = 20_000; // 20 seconds TTL
  private readonly disposables: vscode.Disposable[] = [];

  private static readonly EXCLUDE_PATTERN =
    '{**/node_modules/**,**/.git/**,**/build/**,**/.dart_tool/**,**/bin/**,**/obj/**,**/.vscode/**,**/.idea/**,**/dist/**,**/out/**,**/.next/**,**/.nuxt/**,**/coverage/**,**/*.pyc,**/__pycache__/**,**/*.lock,**/package-lock.json,**/yarn.lock,**/pnpm-lock.yaml}';

  private static readonly IGNORED_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.mp4', '.mp3', '.wav', '.mov', '.pdf', '.zip', '.tar',
    '.gz', '.7z', '.exe', '.dll', '.so', '.dylib', '.wasm',
    '.woff', '.woff2', '.ttf', '.eot', '.jar', '.aar'
  ]);

  constructor() {
    // Watch workspace changes to invalidate cache proactively
    this.disposables.push(
      vscode.workspace.onDidCreateFiles(() => this.invalidateCache()),
      vscode.workspace.onDidDeleteFiles(() => this.invalidateCache()),
      vscode.workspace.onDidRenameFiles(() => this.invalidateCache())
    );
  }

  public invalidateCache(): void {
    this.fileCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Scans the workspace and returns an array of relative file paths.
   */
  public async getWorkspaceFiles(maxFiles = 500): Promise<string[]> {
    const now = Date.now();
    if (this.fileCache && now - this.cacheTimestamp < this.CACHE_TTL_MS) {
      return this.fileCache;
    }

    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      return [];
    }

    try {
      const uris = await vscode.workspace.findFiles(
        '**/*',
        ProjectScanner.EXCLUDE_PATTERN,
        maxFiles
      );

      const relativePaths = uris
        .map(uri => vscode.workspace.asRelativePath(uri, false))
        .filter(relPath => {
          const ext = path.extname(relPath).toLowerCase();
          return !ProjectScanner.IGNORED_EXTENSIONS.has(ext);
        })
        .sort();

      this.fileCache = relativePaths;
      this.cacheTimestamp = now;

      return relativePaths;
    } catch (err) {
      console.error('[ProjectScanner] Error scanning workspace files:', err);
      return [];
    }
  }

  public dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables.length = 0;
  }
}

