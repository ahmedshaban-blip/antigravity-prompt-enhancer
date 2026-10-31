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
exports.inferLanguage = inferLanguage;
const path = __importStar(require("path"));
/**
 * Utility to map file extensions to Markdown / VS Code syntax highlight identifiers.
 */
function inferLanguage(filePath) {
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
//# sourceMappingURL=languageDetector.js.map