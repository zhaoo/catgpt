/** @format */

import * as vscode from 'vscode';
import {request} from '../utils/request';

export async function provideHover(document: vscode.TextDocument, position: vscode.Position) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const selectorText = editor.document.getText(editor.selection);
  if (!selectorText) return;
  const res = await request({
    messages: [{role: 'user', content: `我希望你能充当代码解释者，阐明代码的语法和语义。代码如下：\n${selectorText}`}],
  });
  return new vscode.Hover(['### CatGPT 代码释意\n\n', res]);
}
