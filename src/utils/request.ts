/** @format */

import {StreamRequestCbParams} from '../@types/utils';
import axios from 'axios';
import {get} from 'lodash';
import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('catgpt'); //vscode配置
const MODEL = config.get('model') || 'gpt-3.5-turbo'; //模型
const AUTH: string = config.get('auth') || 'Bearer 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'; //秘钥
const PROXY: string = config.get('proxy') || 'https://ai.xrender.fun/proxy/v1/chat/completions'; //代理

/** 普通请求 */
export const request = async (params: any, cb?: (params: StreamRequestCbParams) => void) => {
  try {
    const response = await axios({
      url: PROXY,
      method: 'post',
      data: JSON.stringify({
        model: MODEL,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
        temperature: 0.5,
        top_p: 0.8,
        stream: false,
        ...params,
      }),
      headers: {
        'content-type': 'application/json',
        authorization: AUTH,
      },
    });
    const content = get(response, 'data.choices[0].message.content');
    cb && cb({content, section: content, done: true});
    return content;
  } catch (e) {
    console.error('普通请求错误: ' + e);
  }
};

/** 流式请求 */
export const streamRequest = async (params: any, cb: (params: StreamRequestCbParams) => void) => {
  try {
    const response = await axios({
      url: 'https://ai.xrender.fun/proxy/v1/chat/completions',
      method: 'post',
      data: JSON.stringify({
        model: MODEL,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
        temperature: 0.5,
        top_p: 0.8,
        stream: true,
        ...params,
      }),
      headers: {
        'content-type': 'application/json',
        authorization: AUTH,
      },
      responseType: 'stream',
    });
    let content = '',
      section = '',
      index = 0,
      temp = '';
    //流式输出
    response.data.on('data', (data: Buffer) => {
      const lines = data
        ?.toString()
        ?.split('\n')
        .filter(line => line.trim() !== '');
      for (const line of lines) {
        index++;
        let message = line.replace(/^data: /, '');
        if (!message || message === '[DONE]') break;
        if (index === 2) {
          temp = message;
          break;
        }
        if (index === 3) message = temp + message;
        try {
          const obj = JSON.parse(message);
          section = get(obj, 'choices[0].delta.content', '');
          content += section;
          cb({content, section, done: false});
        } catch (e) {
          console.error('流式解析错误: ' + e);
        }
      }
    });
    //判断结束
    response.data.on('end', () => {
      cb({content, section, done: true});
    });
  } catch (e) {
    console.error('流式请求错误: ' + e);
  }
};

/** 登录BUC */
export const login = async () => {
  const res = await axios({
    url: 'https://fl-fastai.pre-fc.alibaba-inc.com/api/userInfo',
    method: 'get',
  });
};
