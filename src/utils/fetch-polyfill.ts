/** 
 * node-fetch polyfill
 * 注：langchian 仅支持 Node.js 18+，vscode 插件环境为打包好的 Node.js 16，需加载此垫片，并按此文档替换 langchain 依赖中的流式解析逻辑
 * https://github.com/hwchase17/langchainjs/issues/548#issuecomment-1607846463
 */

import fetch, {Headers, Request, Response} from 'node-fetch';

declare global {
  var fetch: any;
  var Headers: any;
  var Request: any;
  var Response: any;
}

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}
