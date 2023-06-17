/** @format */

import * as vscode from 'vscode';

export class CompletionItemProvider implements vscode.CompletionItemProvider {
  constructor() {}

  public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const textLine = document.lineAt(position.line).text.trim();
    //只在注释中生效
    if (textLine.startsWith('//') || textLine.startsWith('/*') || textLine.startsWith('#')) {
      return [
        {
          label: '代码生成',
          kind: vscode.CompletionItemKind.Function,
          detail: 'CatGPT: 代码生成',
          insertText: '',
          command: {command: 'catgpt.edit-insert', title: '代码插入'},
        },
      ];
    }
  }
}
