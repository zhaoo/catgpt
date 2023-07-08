/** @format */

import * as vscode from 'vscode';
import {ChatOpenAI} from 'langchain/chat_models/openai';
import {OpenAIEmbeddings} from 'langchain/embeddings/openai';
import {RetrievalQAChain} from 'langchain/chains';
import {MemoryVectorStore} from 'langchain/vectorstores/memory';
import {DirectoryLoader} from 'langchain/document_loaders/fs/directory';
import {JSONLoader} from 'langchain/document_loaders/fs/json';
import {TextLoader} from 'langchain/document_loaders/fs/text';
import {PDFLoader} from 'langchain/document_loaders/fs/pdf';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import {CheerioWebBaseLoader} from 'langchain/document_loaders/web/cheerio';
import {isDirectory, isFile} from './index';
import {StreamRequestCbParams} from '../@types/utils';
import './fetch-polyfill';

const config = vscode.workspace.getConfiguration('catgpt'); //vscode配置
const MODEL_NAME: string = config.get('modelName') || 'gpt-3.5-turbo'; //模型类型
const API_KEY: string = config.get('apiKey') || ''; //秘钥
const BASE_PATH: string = config.get('basePath') || ''; //代理

//模型
const model = new ChatOpenAI(
  {openAIApiKey: API_KEY, modelName: MODEL_NAME, temperature: 0, streaming: true},
  {basePath: BASE_PATH},
);
//向量库
const vectorStore: MemoryVectorStore = new MemoryVectorStore(
  new OpenAIEmbeddings({openAIApiKey: API_KEY}, {basePath: BASE_PATH}),
);
//索引链
const chain: RetrievalQAChain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {inputKey: 'input'});

/** 流式请求 */
export const streamRequest = async (input: string, cb: (params: StreamRequestCbParams) => void) => {
  const controller = new AbortController();

  let content = '';
  chain
    .call({input, signal: controller.signal}, [
      {
        handleLLMNewToken(section: string) {
          content += section;
          cb({content, section, done: false});
        },
      },
    ])
    .then((result: any) => cb({content: result.text, section: '', done: true}));

  return controller;
};

/** 加载文件向量 */
export const loadFileVector = async (filePath: string) => {
  const TEXT_SUFFIX = ['.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.py'];
  let fileDocs = null;

  //文件夹
  if (isDirectory(filePath)) {
    //遍历文件夹映射文件类型并装载
    fileDocs = await new DirectoryLoader(filePath, {
      '.json': path => new JSONLoader(path, '/texts'),
      '.pdf': path => new PDFLoader(path),
      ...TEXT_SUFFIX.reduce((acc: any, suffix) => {
        acc[suffix] = (path: string) => new TextLoader(path);
        return acc;
      }, {}),
    }).load();
  }

  //文件
  if (isFile(filePath)) {
    const suffix = '.' + (filePath.match(/\.([^.]+)$/) || [])[1]; //文件扩展名
    if (suffix === '.json') {
      fileDocs = await new JSONLoader(filePath, '/texts').load();
    } else if (suffix === '.pdf') {
      fileDocs = await new PDFLoader(filePath).load();
    } else if (TEXT_SUFFIX.includes(suffix)) {
      fileDocs = await new TextLoader(filePath).load();
    }
  }

  if (!fileDocs) throw new Error('文件格式不支持');
  const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000, chunkOverlap: 200}); //文档转切片
  const docs = await textSplitter.splitDocuments(fileDocs); //获取切片
  vectorStore.addDocuments(docs); //存储内存向量
};

/** 加载网页向量 */
export const loadWebVector = async (url: string) => {
  const loader = new CheerioWebBaseLoader(url);
  const webDocs = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000, chunkOverlap: 200}); //文档转切片
  const docs = await textSplitter.splitDocuments(webDocs); //获取切片
  vectorStore.addDocuments(docs); //存储内存向量
};

/** 加载文本向量 */
export const loadTextVector = async (text: string) => {
  const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000, chunkOverlap: 200});
  const docs = await textSplitter.createDocuments([text]);
  vectorStore.addDocuments(docs); //存储内存向量
};
