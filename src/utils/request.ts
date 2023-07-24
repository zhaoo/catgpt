/** @format */

import axios from 'axios';
import {get} from 'lodash';
import * as vscode from 'vscode';
import {StreamRequestCbParams} from '../@types/utils';
import './fetch-polyfill';

const config = vscode.workspace.getConfiguration('catgpt'); //vscode配置
const MODEL_NAME: string = config.get('modelName') || 'gpt-3.5-turbo'; //模型
const API_KEY: string = config.get('apiKey') || ''; //秘钥
const BASE_PATH: string = config.get('basePath') || ''; //代理

/** 普通请求 */
export const request = async (params: any, cb?: (params: StreamRequestCbParams) => void) => {
  try {
    const response = await axios({
      url: BASE_PATH + '/chat/completions',
      method: 'post',
      data: JSON.stringify({
        model: MODEL_NAME,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
        temperature: 0,
        top_p: 0,
        stream: false,
        ...params,
      }),
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + API_KEY,
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
  const cancelToken = axios.CancelToken.source(); //中断标识
  try {
    const response = await axios({
      url: BASE_PATH + '/chat/completions',
      method: 'post',
      data: JSON.stringify({
        model: MODEL_NAME,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2048,
        temperature: 0,
        top_p: 0,
        stream: true,
        ...params,
      }),
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + API_KEY,
      },
      cancelToken: cancelToken.token,
      responseType: 'stream',
    });

    //流式输出
    let content = '',
      section = '',
      index = 0,
      temp = '';
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

    //输出结束
    response.data.on('end', () => {
      cb({content, section, done: true});
    });
  } catch (e) {
    console.error('流式请求错误: ' + e);
  }
  return cancelToken;
};
