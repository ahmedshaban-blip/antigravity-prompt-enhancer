import * as vscode from 'vscode';

export interface DetectedStack {
  primary: string;
  details: string[];
  summary: string;
}

export class StackDetector {
  /**
   * Analyzes workspace files and configuration files to determine tech stack and architecture.
   */
  public async detectStack(workspaceFiles: string[]): Promise<DetectedStack> {
    const fileSet = new Set(workspaceFiles.map(f => f.toLowerCase().replace(/\\/g, '/')));
    const details: string[] = [];

    // 1. Flutter / Dart
    const hasPubspec = Array.from(fileSet).some(f => f.endsWith('pubspec.yaml'));
    if (hasPubspec) {
      const flutterDetails = await this.inspectPubspec();
      return {
        primary: 'Flutter (Dart)',
        details: flutterDetails,
        summary: `Flutter (Dart)${flutterDetails.length > 0 ? ` [${flutterDetails.join(', ')}]` : ''}`
      };
    }

    // 2. Node / JavaScript / TypeScript (React, Next, Vue, Angular, Nest, Express)
    const hasPackageJson = Array.from(fileSet).some(f => f.endsWith('package.json'));
    if (hasPackageJson) {
      const nodeDetails = await this.inspectPackageJson();
      const primary = nodeDetails.primaryFramework || 'Node.js (JavaScript/TypeScript)';
      return {
        primary,
        details: nodeDetails.frameworks,
        summary: `${primary}${nodeDetails.frameworks.length > 0 ? ` [${nodeDetails.frameworks.join(', ')}]` : ''}`
      };
    }

    // 3. .NET / C#
    const hasDotnet = Array.from(fileSet).some(f => f.endsWith('.csproj') || f.endsWith('.sln') || f.endsWith('global.json'));
    if (hasDotnet) {
      details.push('.NET / C#');
      return {
        primary: '.NET / C#',
        details,
        summary: '.NET / C# Project'
      };
    }

    // 4. Python
    const hasPython = Array.from(fileSet).some(f =>
      f.endsWith('requirements.txt') ||
      f.endsWith('pyproject.toml') ||
      f.endsWith('pipfile') ||
      f.endsWith('setup.py') ||
      f.endsWith('.py')
    );
    if (hasPython) {
      details.push('Python');
      return {
        primary: 'Python',
        details,
        summary: 'Python Project'
      };
    }

    // 5. Rust
    if (fileSet.has('cargo.toml') || Array.from(fileSet).some(f => f.endsWith('/cargo.toml'))) {
      return {
        primary: 'Rust',
        details: ['Cargo'],
        summary: 'Rust (Cargo)'
      };
    }

    // 6. Go
    if (fileSet.has('go.mod') || Array.from(fileSet).some(f => f.endsWith('/go.mod'))) {
      return {
        primary: 'Go',
        details: ['Go Modules'],
        summary: 'Go Project'
      };
    }

    return {
      primary: 'General / Unknown',
      details: [],
      summary: 'General Software Project'
    };
  }

  private async inspectPubspec(): Promise<string[]> {
    const results: string[] = [];
    try {
      const uris = await vscode.workspace.findFiles('**/pubspec.yaml', '**/node_modules/**', 1);
      if (uris.length > 0) {
        const doc = await vscode.workspace.openTextDocument(uris[0]);
        const text = doc.getText();
        if (text.includes('flutter_bloc')) results.push('Bloc');
        if (text.includes('provider')) results.push('Provider');
        if (text.includes('riverpod')) results.push('Riverpod');
        if (text.includes('get:')) results.push('GetX');
        if (text.includes('go_router')) results.push('GoRouter');
        if (text.includes('dio:')) results.push('Dio');
        if (text.includes('sqflite')) results.push('Sqflite');
      }
    } catch {
      // Ignore inspection errors
    }
    return results;
  }

  private async inspectPackageJson(): Promise<{ primaryFramework?: string; frameworks: string[] }> {
    const frameworks: string[] = [];
    let primaryFramework: string | undefined;

    try {
      const uris = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 1);
      if (uris.length > 0) {
        const doc = await vscode.workspace.openTextDocument(uris[0]);
        const json = JSON.parse(doc.getText());
        const allDeps = {
          ...json.dependencies,
          ...json.devDependencies
        };

        if (allDeps['next']) {
          primaryFramework = 'Next.js (React)';
          frameworks.push('Next.js');
        } else if (allDeps['react']) {
          primaryFramework = 'React';
          frameworks.push('React');
        } else if (allDeps['nuxt']) {
          primaryFramework = 'Nuxt.js (Vue)';
          frameworks.push('Nuxt');
        } else if (allDeps['vue']) {
          primaryFramework = 'Vue.js';
          frameworks.push('Vue');
        } else if (allDeps['@angular/core']) {
          primaryFramework = 'Angular';
          frameworks.push('Angular');
        } else if (allDeps['@nestjs/core']) {
          primaryFramework = 'NestJS (Backend)';
          frameworks.push('NestJS');
        } else if (allDeps['express']) {
          primaryFramework = 'Express (Node.js)';
          frameworks.push('Express');
        }

        if (allDeps['typescript']) frameworks.push('TypeScript');
        if (allDeps['tailwindcss']) frameworks.push('TailwindCSS');
        if (allDeps['prisma'] || allDeps['@prisma/client']) frameworks.push('Prisma');
      }
    } catch {
      // Ignore parsing errors
    }

    return { primaryFramework, frameworks };
  }
}

