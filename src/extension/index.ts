/** @format */

import * as vscode from 'vscode';
import {ChatWebviewProvider} from './chatWebview';
import {generatePrompt} from '../utils';

export function activate(context: vscode.ExtensionContext) {
  const chatViewProvider = new ChatWebviewProvider(context); //webview实例

  /** 注册事件 */
  context.subscriptions.push(
    //聊天框
    vscode.window.registerWebviewViewProvider('catgpt.chatWebview', chatViewProvider, {
      webviewOptions: {retainContextWhenHidden: true},
    }),
    vscode.commands.registerTextEditorCommand('catgpt.codeOptimize', editor => handleCode(editor, 'code-optimize')), //代码优化
    vscode.commands.registerTextEditorCommand('catgpt.codeExplain', editor => handleCode(editor, 'code-explain')), //代码解释
    vscode.commands.registerTextEditorCommand('catgpt.codeScore', editor => handleCode(editor, 'code-score')), //代码评分
  );

  /** 代码相关 */
  const handleCode = (editor: any, key: string) => {
    const selectorText = editor.document.getText(editor.selection); //选中的文本
    chatViewProvider.search(generatePrompt(key, selectorText)); //执行搜索
  };
}

export function deactivate() {}
