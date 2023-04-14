/** @format */

import * as vscode from 'vscode';
import {ChatWebviewProvider} from './chatWebview';
import {CodeOptimizeProvider} from './codeOptimize';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(ChatWebviewProvider.register(context)); //聊天框
  context.subscriptions.push(CodeOptimizeProvider.register()); //代码优化
}

export function deactivate() {}
