/** @format */

import * as vscode from 'vscode';
import {ChatWebviewProvider} from './chatWebviewProvider';
import {provideHover} from './hoverProvider';
import {CompletionItemProvider} from './completionItemProvider';
import {handleLogin, handleMenu, handleEditInsert} from './commandHandler';

export function activate(context: vscode.ExtensionContext) {
  const chatViewProvider = new ChatWebviewProvider(context); //webview实例

  /** 事件列表 */
  const SUBSCRIPTIONS = [
    {type: 'TextEditorCommand', commandId: 'catgpt.login', commandHandler: () => handleLogin(context)},
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-optimize',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'code-optimize', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-explain',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'code-explain', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-score',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'code-score', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-find-problems',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'code-find-problems', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-refactor',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'code-refactor', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-documentation',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'code-documentation', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-inspire-programming',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'code-inspire-programming', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-regex',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'tool-regex', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-sql',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'tool-sql', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-console',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'tool-console', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-problems-solution',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'tool-problems-solution', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.qa-list',
      commandHandler: (editor: vscode.TextEditor) =>
        handleMenu(editor, 'qa-list', 'trigger-chat', {showPrompt: false, chatViewProvider}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.edit-insert',
      commandHandler: (editor: vscode.TextEditor) => handleEditInsert(editor, 'stream'),
    },
    {
      type: 'WebviewViewProvider',
      commandId: 'catgpt.chat-webview',
      provider: chatViewProvider,
      options: {webviewOptions: {retainContextWhenHidden: true}},
    },
    {
      type: 'HoverProvider',
      selector: {scheme: 'file'},
      provider: {provideHover},
    },
    {
      type: 'CompletionItemProvider',
      selector: {scheme: 'file'},
      provider: new CompletionItemProvider(),
      paramtriggerCharacters: ':',
    },
  ];

  /** 注册事件 */
  SUBSCRIPTIONS.forEach((sub: any) => {
    switch (sub.type) {
      case 'TextEditorCommand': //命令
        return context.subscriptions.push(vscode.commands.registerTextEditorCommand(sub.commandId, sub.commandHandler));
      case 'WebviewViewProvider': //WebView
        return context.subscriptions.push(
          vscode.window.registerWebviewViewProvider(sub.commandId, sub.provider, sub.options),
        );
      case 'HoverProvider': //悬浮提示
        return context.subscriptions.push(vscode.languages.registerHoverProvider(sub.selector, sub.provider));
      case 'CompletionItemProvider': //代码补全
        return context.subscriptions.push(
          vscode.languages.registerCompletionItemProvider(sub.selector, sub.provider, sub.paramtriggerCharacters),
        );
    }
  });
}

export function deactivate() {}
