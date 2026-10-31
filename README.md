# Antigravity Prompt Enhancer

A production-grade VS Code extension that intercepts a developer's rough prompt draft from the chat input or editor, surgically retrieves relevant project code context via an **Intelligent Two-Stage Context Discovery System**, synthesizes an authoritative master prompt, and replaces the draft in-place via the **Smart Clipboard Pipeline**.

---

## Key Features

- **Dual-Engine LLM Support**:
  - **Internal Models (`vscode.lm`)**: Queries native VS Code language models (Antigravity, Copilot, etc.).
  - **OpenAI-Compatible REST Client**: Directly communicates with any OpenAI-compatible `/chat/completions` endpoint (OpenRouter, Groq, Ollama, DeepSeek, local vLLM).
- **Two-Stage Intelligent Context Pipeline**:
  - **Stage 1 (AI Context Scout)**: Scans relative file paths (excluding caches, dependencies, and build artifacts) and uses LLM reasoning to pinpoint the top 1-3 files most relevant to the developer's intent.
  - **Stage 2 (Master Prompt Synthesis)**: Detects the project stack (Flutter, React, Next.js, Node.js, .NET, Python, etc.) and slices designated code files (up to 200 lines per file). Extracts highlighted editor selections with highest priority. Synthesizes an actionable, authoritative master prompt with clear objectives, architecture conventions, file targets, and verification criteria.
- **In-Place Smart Clipboard Pipeline**:
  - Triggered with a single hotkey (`Ctrl+Alt+E` on Windows/Linux, `Cmd+Alt+E` on macOS).
  - Automatically captures highlighted drafts, crafts the enhanced prompt, and pastes it in-place.

---

## Keyboard Shortcuts

| Shortcut | Platform | Command | Description |
|---|---|---|---|
| `Ctrl+Alt+E` | Windows / Linux | `antigravityEnhancer.enhancePrompt` | Enhance rough prompt in-place with surgical project context |
| `Cmd+Alt+E` | macOS | `antigravityEnhancer.enhancePrompt` | Enhance rough prompt in-place with surgical project context |

---

## Configuration Settings

Configure via **Settings** (`Ctrl+,` or `Cmd+,`) under **Antigravity Prompt Enhancer**:

| Setting | Type | Default | Description |
|---|---|---|---|
| `antigravityEnhancer.provider` | Enum (`internal`, `openai_compatible`) | `"internal"` | AI provider backend to use. |
| `antigravityEnhancer.openaiBaseUrl` | String | `"https://api.openai.com/v1"` | Base URL for OpenAI-compatible `/chat/completions`. |
| `antigravityEnhancer.openaiApiKey` | String | `""` | API key for OpenAI-compatible endpoint. |
| `antigravityEnhancer.openaiModel` | String | `"gpt-4o-mini"` | Model name for completions (e.g. `gpt-4o-mini`, `deepseek-chat`, `llama3`). |
| `antigravityEnhancer.maxContextFiles` | Number (1–10) | `3` | Maximum number of workspace files to include in Stage 1 context. |

---

## Architecture Overview

```text
src/
├── extension.ts                     # Activation, command registry, status bar messages
├── config/
│   └── settings.ts                  # Typed wrapper for extension settings
├── services/
│   ├── llmRouter.ts                 # Unified interface routing to internal or OpenAI backend
│   ├── internalLlmService.ts        # vscode.lm integration
│   ├── openAiService.ts             # OpenAI-compatible HTTP fetch implementation
│   ├── contextScout.ts              # Stage 1: File relevance reasoning engine
│   ├── precisionReader.ts           # Token-conscious file reader and active selection collector
│   └── promptSynthesizer.ts         # Stage 2: Master prompt generator
├── context/
│   ├── projectScanner.ts            # Fast glob-based file path collector with cache
│   └── stackDetector.ts             # Detects Flutter, Node, React, Python, or .NET
└── pipeline/
    └── clipboardPipeline.ts         # Safe clipboard copy/paste orchestration
```

---

## Building and Packaging

```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript
npm run compile

# 3. Package extension into .vsix
npm run package
```

---

## License

MIT

