/** @format */

import * as vscode from 'vscode';
import {request} from '../utils/request';

export class CodeOptimizeProvider {
  private static command: string = 'catgpt.codeOptimize'; //事件ID

  /** 注册事件 */
  public static register = (): vscode.Disposable => {
    return vscode.commands.registerCommand(this.command, this.doCodeOptimize());
  };

  /** 生成提示词 */
  private static generatePrompt(prompt: string): string {
    return `以百分制给这段代码评分，代码如下：${prompt}`;
  }

  /** 鼓励语录 */
  private static getQuotation(score: number) {
    switch (Math.floor(score / 10)) {
      case 10:
        return '今天最好的表现是明天最低要求！';
      case 9:
        return '我很看好你，所以对你的要求要比别人高！';
      case 8:
        return '你的体系化思考在哪里？是否沉淀了一套可复用的方法论？';
      case 7:
        return '苦劳不等于功劳！你的抓手在哪里？有没有形成闭环？';
      case 6:
        return '你和别人做有什么不一样？不难要你干什么！';
      case 5:
        return '其实，我对你是有一些失望的！';
      default:
        return '组织经过慎重考虑，决定给你年度3.25，加把劲！';
    }
  }

  /** 执行代码优化 */
  private static doCodeOptimize(): any {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const selection = editor.selection;
    const selectorText = editor.document.getText(selection); //选中的文本
    request({messages: [{role: 'user', content: this.generatePrompt(selectorText)}]}, content => {
      console.log(content);
      const score = String(content).match(/\d+/);
      const quotation = this.getQuotation(Number(score));
      vscode.window.showInformationMessage(`评分：${score}分，${quotation}`);
    });
  }
}
