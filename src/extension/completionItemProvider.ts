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
          detail: 'CatGPT: 基于描述的需求生成代码',
          insertText: '',
          command: {command: 'catgpt.edit-generate', title: '代码生成'},
        },
        {
          label: '代码片段',
          kind: vscode.CompletionItemKind.Function,
          detail: 'CatGPT: 基于载入的上下文或网络，输出预置代码片段',
          insertText: '',
          command: {command: 'catgpt.edit-snippet', title: '代码片段'},
        },
      ];
    }
  }
}
