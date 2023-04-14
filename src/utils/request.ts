/** @format */

import {StreamRequestCbParams} from '../@types/utils';
import axios from 'axios';
import {get} from 'lodash';

const MODEL = 'gpt-3.5-turbo'; //模型
const AUTH = 'XXXXX'; //秘钥
const PROXY = 'XXXXX'; //代理

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
        max_tokens: 2000,
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
    cb(content);
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
        max_tokens: 2000,
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
    const stream = response.data;
    stream.on('data', (data: any) => {
      data = data.toString().split('data: ')[1];
      if (!data || data === '[DONE]') return;
      const dataObj = JSON.parse(data);
      const content = get(dataObj, 'choices[0].delta.content', '');
      cb(content);
    });
  } catch (e) {
    console.error('流式请求错误: ' + e);
  }
};
