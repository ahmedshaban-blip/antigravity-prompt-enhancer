import * as vscode from 'vscode';
import { getExtensionConfig, CONFIG_SECTION } from './config/settings';
import { LlmRouter } from './services/llmRouter';
import { ContextScout } from './services/contextScout';
import { PrecisionReader } from './services/precisionReader';
import { PromptSynthesizer } from './services/promptSynthesizer';
import { ProjectScanner } from './context/projectScanner';
import { StackDetector } from './context/stackDetector';
import { ClipboardPipeline } from './pipeline/clipboardPipeline';
import { SettingsWebviewProvider } from './views/settingsWebviewProvider';

let projectScanner: ProjectScanner | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

export function activate(context: vscode.ExtensionContext): void {
  projectScanner = new ProjectScanner();
  const stackDetector = new StackDetector();
  const llmRouter = new LlmRouter();
  const contextScout = new ContextScout(llmRouter);
  const precisionReader = new PrecisionReader();
  const promptSynthesizer = new PromptSynthesizer(llmRouter);
  const clipboardPipeline = new ClipboardPipeline();

  // Register bespoke anti-AI-slop sidebar Webview view
  const settingsWebviewProvider = new SettingsWebviewProvider(context.extensionUri, llmRouter);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SettingsWebviewProvider.viewType,
      settingsWebviewProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'antigravityEnhancer.openSettingsView';
  statusBarItem.tooltip = 'Click to open Antigravity Prompt Enhancer settings in Sidebar';
  updateStatusBar();
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(projectScanner);

  // Update status bar when configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(CONFIG_SECTION)) {
        updateStatusBar();
      }
    })
  );

  // Command to open / focus the sidebar view
  const openSettingsViewCommand = vscode.commands.registerCommand(
    'antigravityEnhancer.openSettingsView',
    async () => {
      await vscode.commands.executeCommand('antigravityEnhancer.settingsView.focus');
    }
  );
  context.subscriptions.push(openSettingsViewCommand);

  // Register the primary enhancement command (Ctrl+Alt+E / Cmd+Alt+E)
  const enhanceCommand = vscode.commands.registerCommand(
    'antigravityEnhancer.enhancePrompt',
    async () => {
      try {
        await executeEnhancementPipeline({
          projectScanner: projectScanner!,
          stackDetector,
          contextScout,
          precisionReader,
          promptSynthesizer,
          clipboardPipeline
        });
      } catch (err: unknown) {
        if (err instanceof vscode.CancellationError) {
          vscode.window.setStatusBarMessage('Enhancement cancelled.', 2500);
          return;
        }

        const msg = err instanceof Error ? err.message : String(err);
        const action = await vscode.window.showErrorMessage(
          `Prompt Enhancement: ${msg}`,
          'Open Settings'
        );

        if (action === 'Open Settings') {
          vscode.commands.executeCommand('antigravityEnhancer.openSettingsView');
        }
      }
    }
  );

  context.subscriptions.push(enhanceCommand);
}

interface PipelineComponents {
  projectScanner: ProjectScanner;
  stackDetector: StackDetector;
  contextScout: ContextScout;
  precisionReader: PrecisionReader;
  promptSynthesizer: PromptSynthesizer;
  clipboardPipeline: ClipboardPipeline;
}

async function executeEnhancementPipeline(components: PipelineComponents): Promise<void> {
  const captureResult = await components.clipboardPipeline.captureDraft();
  if (!captureResult || !captureResult.draft.trim()) {
    vscode.window.showInformationMessage('No prompt draft detected. Highlight text in chat or editor, then press Ctrl+Alt+E.');
    return;
  }

  const rawDraft = captureResult.draft;
  const config = getExtensionConfig();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Antigravity Prompt Enhancer',
      cancellable: true
    },
    async (progress, cancellationToken) => {
      progress.report({ message: 'Stage 1: Scouting relevant context...', increment: 20 });

      const workspaceFiles = await components.projectScanner.getWorkspaceFiles(500);
      const stack = await components.stackDetector.detectStack(workspaceFiles);

      const activeEditorPath = vscode.window.activeTextEditor
        ? vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.uri)
        : undefined;

      const relevantFiles = await components.contextScout.scoutRelevantFiles(
        rawDraft,
        activeEditorPath,
        workspaceFiles,
        config.maxContextFiles,
        cancellationToken
      );

      progress.report({ message: 'Stage 2: Synthesizing master prompt with precision slices...', increment: 40 });

      const precisionContext = await components.precisionReader.readPrecisionContext(relevantFiles);

      const synthesisResult = await components.promptSynthesizer.synthesize(
        rawDraft,
        stack,
        precisionContext,
        cancellationToken
      );

      progress.report({ message: 'Replacing prompt in-place...', increment: 30 });
      await components.clipboardPipeline.replaceInPlace(synthesisResult.prompt);

      progress.report({ message: 'Done!', increment: 10 });

      const statusMsg = synthesisResult.mode === 'llm_synthesized'
        ? '✅ Prompt enhanced via AI!'
        : '✅ Prompt enhanced with surgical workspace context!';
      vscode.window.setStatusBarMessage(statusMsg, 3500);
    }
  );
}

function updateStatusBar(): void {
  if (!statusBarItem) return;

  const config = getExtensionConfig();
  if (config.provider === 'gemini') {
    statusBarItem.text = `$(sparkle) Enhancer: Gemini (${config.geminiModel})`;
  } else if (config.provider === 'openai_compatible') {
    statusBarItem.text = `$(sparkle) Enhancer: OpenAI (${config.openaiModel})`;
  } else {
    statusBarItem.text = `$(sparkle) Enhancer: Antigravity Context`;
  }
}

export function deactivate(): void {
  projectScanner?.dispose();
  statusBarItem?.dispose();
}
