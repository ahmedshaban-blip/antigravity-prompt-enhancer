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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const settings_1 = require("./config/settings");
const llmRouter_1 = require("./services/llmRouter");
const contextScout_1 = require("./services/contextScout");
const precisionReader_1 = require("./services/precisionReader");
const promptSynthesizer_1 = require("./services/promptSynthesizer");
const projectScanner_1 = require("./context/projectScanner");
const stackDetector_1 = require("./context/stackDetector");
const clipboardPipeline_1 = require("./pipeline/clipboardPipeline");
let projectScanner;
let statusBarItem;
function activate(context) {
    projectScanner = new projectScanner_1.ProjectScanner();
    const stackDetector = new stackDetector_1.StackDetector();
    const llmRouter = new llmRouter_1.LlmRouter();
    const contextScout = new contextScout_1.ContextScout(llmRouter);
    const precisionReader = new precisionReader_1.PrecisionReader();
    const promptSynthesizer = new promptSynthesizer_1.PromptSynthesizer(llmRouter);
    const clipboardPipeline = new clipboardPipeline_1.ClipboardPipeline();
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'workbench.action.openSettings';
    statusBarItem.tooltip = 'Click to configure Antigravity Prompt Enhancer settings';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(projectScanner);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration(settings_1.CONFIG_SECTION)) {
            updateStatusBar();
        }
    }));
    const enhanceCommand = vscode.commands.registerCommand('antigravityEnhancer.enhancePrompt', async () => {
        try {
            await executeEnhancementPipeline({
                projectScanner: projectScanner,
                stackDetector,
                contextScout,
                precisionReader,
                promptSynthesizer,
                clipboardPipeline
            });
        }
        catch (err) {
            if (err instanceof vscode.CancellationError) {
                vscode.window.setStatusBarMessage('Enhancement cancelled.', 2500);
                return;
            }
            const msg = err instanceof Error ? err.message : String(err);
            const action = await vscode.window.showErrorMessage(`Prompt Enhancement: ${msg}`, 'Open Settings');
            if (action === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', settings_1.CONFIG_SECTION);
            }
        }
    });
    context.subscriptions.push(enhanceCommand);
}
async function executeEnhancementPipeline(components) {
    const captureResult = await components.clipboardPipeline.captureDraft();
    if (!captureResult || !captureResult.draft.trim()) {
        vscode.window.showInformationMessage('No prompt draft detected. Highlight text in chat or editor, then press Ctrl+Alt+E.');
        return;
    }
    const rawDraft = captureResult.draft;
    const config = (0, settings_1.getExtensionConfig)();
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Antigravity Prompt Enhancer',
        cancellable: true
    }, async (progress, cancellationToken) => {
        progress.report({ message: 'Stage 1: Scouting relevant context...', increment: 20 });
        const workspaceFiles = await components.projectScanner.getWorkspaceFiles(500);
        const stack = await components.stackDetector.detectStack(workspaceFiles);
        const activeEditorPath = vscode.window.activeTextEditor
            ? vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.uri)
            : undefined;
        const relevantFiles = await components.contextScout.scoutRelevantFiles(rawDraft, activeEditorPath, workspaceFiles, config.maxContextFiles, cancellationToken);
        progress.report({ message: 'Stage 2: Synthesizing master prompt with precision slices...', increment: 40 });
        const precisionContext = await components.precisionReader.readPrecisionContext(relevantFiles);
        const synthesisResult = await components.promptSynthesizer.synthesize(rawDraft, stack, precisionContext, cancellationToken);
        progress.report({ message: 'Replacing prompt in-place...', increment: 30 });
        await components.clipboardPipeline.replaceInPlace(synthesisResult.prompt);
        progress.report({ message: 'Done!', increment: 10 });
        const statusMsg = synthesisResult.mode === 'llm_synthesized'
            ? '✅ Prompt enhanced via AI!'
            : '✅ Prompt enhanced with surgical workspace context!';
        vscode.window.setStatusBarMessage(statusMsg, 3500);
    });
}
function updateStatusBar() {
    if (!statusBarItem)
        return;
    const config = (0, settings_1.getExtensionConfig)();
    if (config.provider === 'gemini') {
        statusBarItem.text = `$(sparkle) Enhancer: Gemini (${config.geminiModel})`;
    }
    else if (config.provider === 'openai_compatible') {
        statusBarItem.text = `$(sparkle) Enhancer: OpenAI (${config.openaiModel})`;
    }
    else {
        statusBarItem.text = `$(sparkle) Enhancer: Antigravity Context`;
    }
}
function deactivate() {
    projectScanner?.dispose();
    statusBarItem?.dispose();
}
//# sourceMappingURL=extension.js.map