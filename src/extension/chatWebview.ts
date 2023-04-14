/** @format */

import * as vscode from 'vscode';
import {generateID} from '../utils/index';
import {streamRequest} from '../utils/request';

export class ChatWebviewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}
  private static command: string = 'catgpt.chatWebview'; //事件ID
  private view?: vscode.WebviewView; //视图

  /** 注册事件 */
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerWebviewViewProvider(this.command, new ChatWebviewProvider(context));
  }

  /** 开始搜索 */
  public search(prompt?: string) {
    const key = generateID();
    streamRequest({messages: [{role: 'user', content: prompt}]}, content => {
      this.view?.show?.(true);
      this.view?.webview.postMessage({type: 'answer', value: {content, key}});
    });
  }

  /** 生成 Webview */
  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    this.view = webviewView; //绑定视图
    webviewView.webview.options = {enableScripts: true}; //开启脚本
    const baseUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'source')); //资源路径

    //接收事件
    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'question':
          return this.search(data.value);
      }
    });

    //视图模板
    webviewView.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
          <title>Fliggy-ChatGPT</title>
          <link href="${baseUri}/index.css" rel="stylesheet"/>
        </head>
        <body>
          <content id="chat-container" class="chat-container" />
          <footer>
            <textarea id="search-input" class="input" type="text" rows="1" tabindex="0" placeholder="来撩我吧..."></textarea>
            <button id="search-button" class="button" type="submit">发送</button>
          </footer>
        </body>
        <script src="${baseUri}/index.js" />
      </html>
    `;
  }
}
