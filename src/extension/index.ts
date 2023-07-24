/** @format */

import * as vscode from 'vscode';
import {ChatWebviewProvider} from './chatWebviewProvider';
import {provideHover} from './hoverProvider';
import {CompletionItemProvider} from './completionItemProvider';
import {CodeLensProvider} from './codeLensProvider';
import {handleLogin, handleEditInsert, handleTriggerChat, handleLoadVector} from './commandHandler';

export function activate(context: vscode.ExtensionContext) {
  const chatViewProvider = new ChatWebviewProvider(context); //webview实例

  const catStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
  catStatusBar.command = 'catgpt.load-vector';
  catStatusBar.text = `$(files) CatGPT`;
  catStatusBar.show();

  /** 事件列表 */
  const SUBSCRIPTIONS = [
    {
      type: 'StatusBarItem',
      statusBarItem: catStatusBar,
    },
    {
      type: 'CodeLensProvider',
      selector: {scheme: 'file'},
      provider: new CodeLensProvider(),
    },
    {
      type: 'WebviewViewProvider',
      commandId: 'catgpt.chat-webview',
      provider: chatViewProvider,
      options: {webviewOptions: {retainContextWhenHidden: true}},
    },
    // {
    //   type: 'HoverProvider',
    //   selector: {scheme: 'file'},
    //   provider: {provideHover},
    // },
    {
      type: 'CompletionItemProvider',
      selector: {scheme: 'file'},
      provider: new CompletionItemProvider(),
      paramtriggerCharacters: ' ',
    },
    {
      type: 'Command',
      commandId: 'catgpt.load-vector',
      commandHandler: (content: string) => handleLoadVector(),
    },
    {
      type: 'Command',
      commandId: 'catgpt.code-function-explain',
      commandHandler: (content: string) => {
        handleTriggerChat('code-function-explain', 'input', chatViewProvider, {showPrompt: false, content});
      },
    },
    {
      type: 'Command',
      commandId: 'catgpt.code-function-refactor',
      commandHandler: (content: string) => {
        handleTriggerChat('code-function-refactor', 'input', chatViewProvider, {showPrompt: false, content});
      },
    },
    {type: 'TextEditorCommand', commandId: 'catgpt.login', commandHandler: () => handleLogin(context)},
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-optimize',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('code-optimize', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-explain',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('code-explain', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-score',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('code-score', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-find-problems',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('code-find-problems', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-refactor',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('code-refactor', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.code-documentation',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('code-documentation', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-inspire-programming',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('code-inspire-programming', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-regex',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('tool-regex', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-sql',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('tool-sql', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-console',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('tool-console', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.tool-problems-solution',
      commandHandler: (editor: vscode.TextEditor) =>
        handleTriggerChat('tool-problems-solution', 'edit-selector', chatViewProvider, {showPrompt: false, editor}),
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.edit-generate',
      commandHandler: (editor: vscode.TextEditor) => {
        const language = editor.document.languageId; //当前语言
        const position = editor.selection.active; //插入位置
        const lineText = editor.document.lineAt(position.line).text; //选中文本
        const prompt = `帮我生成一段 ${language} 代码，要求如下：${lineText}，只需要输出纯代码而不需要其他任何文本`;
        handleEditInsert(editor, prompt, 'stream');
      },
    },
    {
      type: 'TextEditorCommand',
      commandId: 'catgpt.edit-snippet',
      commandHandler: (editor: vscode.TextEditor) => {
        const position = editor.selection.active; //插入位置
        const lineText = editor.document.lineAt(position.line).text; //选中文本
        const prompt = `帮我生成代码片段，要求如下：${lineText}，只需要输出纯代码而不需要其他任何文本`;
        handleEditInsert(editor, prompt, 'stream');
      },
    },
  ];

  /** 注册事件 */
  SUBSCRIPTIONS.forEach((sub: any) => {
    switch (sub.type) {
      case 'Command': //普通命令
        return context.subscriptions.push(vscode.commands.registerCommand(sub.commandId, sub.commandHandler));
      case 'TextEditorCommand': //编辑器命令
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
      case 'CodeLensProvider': //代码提示
        return context.subscriptions.push(vscode.languages.registerCodeLensProvider(sub.selector, sub.provider));
      case 'StatusBarItem': //状态栏
        return context.subscriptions.push(sub.statusBarItem);
    }
  });
}

export function deactivate() {}
