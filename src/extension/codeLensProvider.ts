/** @format */

import * as vscode from 'vscode';

/** 代码提示 */
export class CodeLensProvider implements vscode.CodeLensProvider {
  async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const funcRegex = /function\s+(\w+)\s*\((.*?)\)\s*\{([\s\S]*?)\}/g;
    const arrowFuncRegex = /(const|let|var)\s+(\w+)\s*=\s*(\([^)]*\)|\w+)\s*=>\s*\{([\s\S]*?)\}/g;
    let match;

    while ((match = funcRegex.exec(text))) {
      const [content, name, params, body] = match;
      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + content.length),
      );
      const explainCodeLens = new vscode.CodeLens(range, {
        title: '解释',
        command: 'catgpt.code-function-explain',
        arguments: [content],
      });
      codeLenses.push(explainCodeLens);
      const refactorCodeLens = new vscode.CodeLens(range, {
        title: '重构',
        command: 'catgpt.code-function-refactor',
        arguments: [content],
      });
      codeLenses.push(refactorCodeLens);
    }

    while ((match = arrowFuncRegex.exec(text))) {
      const [content, keyword, name, params, body] = match;
      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + content.length),
      );
      const explainCodeLens = new vscode.CodeLens(range, {
        title: '解释',
        command: 'catgpt.code-function-explain',
        arguments: [content],
      });
      codeLenses.push(explainCodeLens);
      const refactorCodeLens = new vscode.CodeLens(range, {
        title: '重构',
        command: 'catgpt.code-function-refactor',
        arguments: [content],
      });
      codeLenses.push(refactorCodeLens);
    }

    return codeLenses;
  }

  resolveCodeLens(codeLens: vscode.CodeLens): vscode.ProviderResult<vscode.CodeLens> {
    return codeLens;
  }
}
