/** @format */

import * as vscode from 'vscode';
import {CancelTokenSource} from 'axios';
import {generateID} from '../utils/index';
import {streamRequest} from '../utils/request';

export class ChatWebviewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}
  private static command: string = 'catgpt.chatWebview'; //事件ID
  private config = vscode.workspace.getConfiguration('catgpt'); //配置
  private view?: vscode.WebviewView; //视图
  private cancelToken?: CancelTokenSource; //输出取消标识
  private processing: boolean = false; //处理中
  private chatRecords: any[] = []; //对话记录

  /** 注册事件 */
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerWebviewViewProvider(this.command, new ChatWebviewProvider(context), {
      webviewOptions: {retainContextWhenHidden: true}, //缓存记录，比较消耗内存
    });
  }

  /** 开始询问 */
  public async search(prompt?: string, showPrompt = true) {
    if (this.processing) return vscode.window.showInformationMessage('处理中，不要着急哦...🍵');
    const user = this.context.globalState.get('user');
    const ai = {nickname: this.config.get('aiNickname'), avatar: this.config.get('aiAvatar')};
    this.view?.show?.(true);
    showPrompt &&
      this.view?.webview.postMessage({
        type: 'ask',
        value: {content: prompt, key: generateID(), user, ai},
      });
    const answerKey = generateID();
    this.processing = true;
    this.chatRecords.push({role: 'user', content: prompt});
    this.cancelToken = await streamRequest({messages: this.chatRecords}, ({content, done}) => {
      this.view?.webview.postMessage({type: 'answer', value: {content, key: answerKey, done, user, ai}});
      if (done) {
        this.chatRecords.push({role: 'assistant', content});
        this.processing = false;
      }
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
        case 'search': //开始搜索
          return this.search(data.value);
        //取消输出
        case 'cancel': {
          this.processing = false;
          this.cancelToken && this.cancelToken.cancel('流式输出取消');
          return;
        }
        case 'copy': //复制代码
          return vscode.window.showInformationMessage('代码已复制到剪切板，赶紧去粘贴吧~');
        //插入代码
        case 'insert': {
          const position = vscode.window.activeTextEditor?.selection.active;
          if (!position) return;
          vscode.window.activeTextEditor?.edit(editBuilder => editBuilder.insert(position.translate(1, 0), data.value));
          vscode.window.showInformationMessage('代码已插入编辑器，是不是比“CV”还快~');
        }
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
          <title>CatGPT</title>
          <link href="${baseUri}/index.css" rel="stylesheet"/>
          <link href="${baseUri}/vendor/highlight.min.css" rel="stylesheet">
          <script src="${baseUri}/vendor/highlight.min.js"></script>
          <script src="${baseUri}/vendor/marked.min.js"></script>
        </head>
        <body class="chat-body">
          <svg id="chat-cancel" class="chat-cancel" t="1686290282249" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10259" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128"><path d="M512 73.142857q119.428571 0 220.285714 58.857143t159.714286 159.714286 58.857143 220.285714-58.857143 220.285714-159.714286 159.714286-220.285714 58.857143-220.285714-58.857143-159.714286-159.714286-58.857143-220.285714 58.857143-220.285714 159.714286-159.714286 220.285714-58.857143zm0 749.714286q84.571429 0 156-41.714286t113.142857-113.142857 41.714286-156-41.714286-156-113.142857-113.142857-156-41.714286-156 41.714286-113.142857 113.142857-41.714286 156 41.714286 156 113.142857 113.142857 156 41.714286zm-164.571429-128q-8 0-13.142857-5.142857t-5.142857-13.142857l0-329.142857q0-8 5.142857-13.142857t13.142857-5.142857l329.142857 0q8 0 13.142857 5.142857t5.142857 13.142857l0 329.142857q0 8-5.142857 13.142857t-13.142857 5.142857l-329.142857 0z" p-id="10260"></path></svg>
          <svg id="chat-clear" class="chat-clear" t="1681959600237" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20068" width="128" height="128"><path d="M402.285714 420.571429l0 329.142857q0 8-5.142857 13.142857t-13.142857 5.142857l-36.571429 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-329.142857q0-8 5.142857-13.142857t13.142857-5.142857l36.571429 0q8 0 13.142857 5.142857t5.142857 13.142857zm146.285714 0l0 329.142857q0 8-5.142857 13.142857t-13.142857 5.142857l-36.571429 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-329.142857q0-8 5.142857-13.142857t13.142857-5.142857l36.571429 0q8 0 13.142857 5.142857t5.142857 13.142857zm146.285714 0l0 329.142857q0 8-5.142857 13.142857t-13.142857 5.142857l-36.571429 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-329.142857q0-8 5.142857-13.142857t13.142857-5.142857l36.571429 0q8 0 13.142857 5.142857t5.142857 13.142857zm73.142857 413.714286l0-541.714286-512 0 0 541.714286q0 12.571429 4 23.142857t8.285714 15.428571 6 4.857143l475.428571 0q1.714286 0 6-4.857143t8.285714-15.428571 4-23.142857zm-384-614.857143l256 0-27.428571-66.857143q-4-5.142857-9.714286-6.285714l-181.142857 0q-5.714286 1.142857-9.714286 6.285714zm530.285714 18.285714l0 36.571429q0 8-5.142857 13.142857t-13.142857 5.142857l-54.857143 0 0 541.714286q0 47.428571-26.857143 82t-64.571429 34.571429l-475.428571 0q-37.714286 0-64.571429-33.428571t-26.857143-80.857143l0-544-54.857143 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-36.571429q0-8 5.142857-13.142857t13.142857-5.142857l176.571429 0 40-95.428571q8.571429-21.142857 30.857143-36t45.142857-14.857143l182.857143 0q22.857143 0 45.142857 14.857143t30.857143 36l40 95.428571 176.571429 0q8 0 13.142857 5.142857t5.142857 13.142857z" p-id="20069"></path></svg>
          <content id="chat-container" class="chat-container"></content>
          <footer class="chat-footer">
            <textarea id="chat-input" class="chat-input" type="text" rows="1" tabindex="0" placeholder="来撩我吧..."></textarea>
            <button id="chat-search" class="chat-search" type="submit">发送</button>
          </footer>
          <script src="${baseUri}/index.js" />
        </body>
      </html>
    `;
  }
}
