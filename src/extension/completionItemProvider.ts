/** @format */

import * as vscode from 'vscode';

export class CompletionItemProvider implements vscode.CompletionItemProvider {
  constructor() {}

  public async provideCompletionItems() {
    const completion = {
      label: '代码生成',
      kind: vscode.CompletionItemKind.Function,
      detail: 'CatGPT: 代码生成',
      insertText: '',
      command: {command: 'catgpt.edit-insert', title: '代码插入'},
    };
    return [completion];
  }
}
