/** @format */

import * as vscode from 'vscode';
import {generatePrompt} from '../utils';
import {request} from '../utils/request';

/** 登录BUC */
export const handleLogin = async (context: vscode.ExtensionContext) => {
  const AUTH_URL = 'https://fl-fastai.pre-fc.alibaba-inc.com//#/catgpt/auth'; //验证地址

  //注册回调监听
  vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
      const queryParams = new URLSearchParams(uri.query); //从回调获取用户
      if (queryParams.has('nickname') && queryParams.has('avatar')) {
        context.globalState.update(
          'user',
          JSON.stringify({
            nickname: queryParams.get('nickname'),
            avatar: queryParams.get('avatar'),
          }),
        );
        vscode.window.showInformationMessage('BUC登录成功~');
      } else {
        vscode.window.showErrorMessage('BUC登录失败，请稍后再试~');
      }
    },
  });

  const redirectUri = await vscode.env.asExternalUri(vscode.Uri.parse(`${vscode.env.uriScheme}://zhaoo.catgpt/`)); //登录页面

  //打开页面
  await vscode.env.openExternal(
    vscode.Uri.parse(AUTH_URL).with({
      query: `redirect=${encodeURIComponent(redirectUri.toString(true))}`,
    }),
  );
};

/** 菜单操作 */
export const handleMenu = (editor: vscode.TextEditor, key: string, type: string, extend: any = {}) => {
  const selectorText = editor.document.getText(editor.selection); //选中的文本
  if (!selectorText) return;
  switch (type) {
    //唤起聊天框
    case 'trigger-chat': {
      const {showPrompt = true, chatViewProvider} = extend;
      return chatViewProvider.search(generatePrompt(key, selectorText), showPrompt); //执行搜索
    }
  }
};

/** 插入编辑器 */
export const handleEditInsert = async (editor: vscode.TextEditor) => {
  const language = editor.document.languageId; //当前语言
  const position = editor.selection.active; //插入位置
  const lineText = editor.document.lineAt(position.line).text; //选中文本
  vscode.commands.executeCommand('editor.action.insertLineAfter'); //光标锚到下一行
  const prompt = `帮我生成一段 ${language} 代码，要求如下：${lineText}，只需要输出纯代码而不需要其他任何文本`;
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: '猫猫正在努力思考，主人不要着急... 🍵',
      cancellable: true,
    },
    async (progress, token) => {
      const genCode = await request({messages: [{role: 'user', content: prompt}]});
      if (token.isCancellationRequested) return;
      editor.edit(editBuilder => editBuilder.insert(position.translate(1, 0), genCode));
    },
  );
};
