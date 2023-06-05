/** @format */

//流式请求入参
export interface StreamRequestOptions {
  api: string;
  params?: object | URLSearchParams | undefined;
  method?: 'get' | 'post';
  [k: string]: any;
}

//流式请求回调
export interface StreamRequestCbParams {
  done: boolean;
  content: string;
  section: string;
}
