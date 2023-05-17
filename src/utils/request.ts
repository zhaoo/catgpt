/** @format */

import {StreamRequestCbParams} from '../@types/utils';
import axios from 'axios';
import {get} from 'lodash';

const MODEL = 'gpt-4'; //模型
const AUTH = 'Bearer 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'; //秘钥
const PROXY = 'https://ai.xrender.fun/proxy/v1/chat/completions'; //代理

/** 普通请求 */
export const request = async (params: any, cb: (params: StreamRequestCbParams) => void) => {
  try {
    const response = await axios({
      url: PROXY,
      method: 'post',
      data: JSON.stringify({
        model: MODEL,
        frequency_penalty: 0,
        presence_penalty: 1,
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
    cb({content, done: true});
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
        presence_penalty: 1,
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
    let content = '';
    //流式输出
    response.data.on('data', (data: Buffer) => {
      const lines = data
        ?.toString()
        ?.split('\n')
        .filter(line => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (!message || message === '[DONE]') break;
        try {
          const obj = JSON.parse(message);
          content += get(obj, 'choices[0].delta.content', '');
          cb({content, done: false});
        } catch (e) {
          console.error('流式解析错误: ' + e);
        }
      }
    });
    //判断结束
    response.data.on('end', () => {
      cb({content, done: true});
    });
  } catch (e) {
    console.error('流式请求错误: ' + e);
  }
};
