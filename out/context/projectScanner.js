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
exports.ProjectScanner = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class ProjectScanner {
    fileCache = null;
    cacheTimestamp = 0;
    CACHE_TTL_MS = 20_000; // 20 seconds TTL
    disposables = [];
    static EXCLUDE_PATTERN = '{**/node_modules/**,**/.git/**,**/build/**,**/.dart_tool/**,**/bin/**,**/obj/**,**/.vscode/**,**/.idea/**,**/dist/**,**/out/**,**/.next/**,**/.nuxt/**,**/coverage/**,**/*.pyc,**/__pycache__/**,**/*.lock,**/package-lock.json,**/yarn.lock,**/pnpm-lock.yaml}';
    static IGNORED_EXTENSIONS = new Set([
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
        '.mp4', '.mp3', '.wav', '.mov', '.pdf', '.zip', '.tar',
        '.gz', '.7z', '.exe', '.dll', '.so', '.dylib', '.wasm',
        '.woff', '.woff2', '.ttf', '.eot', '.jar', '.aar'
    ]);
    constructor() {
        // Watch workspace changes to invalidate cache proactively
        this.disposables.push(vscode.workspace.onDidCreateFiles(() => this.invalidateCache()), vscode.workspace.onDidDeleteFiles(() => this.invalidateCache()), vscode.workspace.onDidRenameFiles(() => this.invalidateCache()));
    }
    invalidateCache() {
        this.fileCache = null;
        this.cacheTimestamp = 0;
    }
    /**
     * Scans the workspace and returns an array of relative file paths.
     */
    async getWorkspaceFiles(maxFiles = 500) {
        const now = Date.now();
        if (this.fileCache && now - this.cacheTimestamp < this.CACHE_TTL_MS) {
            return this.fileCache;
        }
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            return [];
        }
        try {
            const uris = await vscode.workspace.findFiles('**/*', ProjectScanner.EXCLUDE_PATTERN, maxFiles);
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
        }
        catch (err) {
            console.error('[ProjectScanner] Error scanning workspace files:', err);
            return [];
        }
    }
    dispose() {
        for (const d of this.disposables) {
            d.dispose();
        }
        this.disposables.length = 0;
    }
}
exports.ProjectScanner = ProjectScanner;
//# sourceMappingURL=projectScanner.js.map