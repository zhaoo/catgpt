/** @format */

import {BaseChatModel} from 'langchain/chat_models/base';
import axios from 'axios';
import {BaseChatMessage, ChatResult} from 'langchain/dist/schema';
import {AIChatMessage} from 'langchain/schema';

export class ChatGlm6BLLM extends BaseChatModel {
  modelName: 'chatglm';
  // prompt: string;
  temperature: number = 0;
  max_length: number = 4096;
  top_p: number = 0;
  history: [][];

  constructor(fields: any, configuration?: any) {
    super(fields ?? {});

    Object.defineProperty(this, 'temperature', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0.7,
    });
    Object.defineProperty(this, 'max_length', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 2048,
    });
    Object.defineProperty(this, 'top_p', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0.7,
    });
    this.modelName = 'chatglm';
    this.temperature = fields?.temperature ?? this.temperature;
    this.max_length = fields?.max_length ?? this.max_length;
    this.top_p = fields?.top_p ?? this.top_p;
    this.history = fields?.history ?? [];
  }
  invocationParams() {
    return {
      model: this.modelName,
      temperature: this.temperature,
      top_p: this.top_p,
      max_length: this.max_length,
      history: this.history,
    };
  }
  _identifyingParams() {
    return {
      model_name: this.modelName,
      ...this.invocationParams(),
    };
  }
  /**
   * Get the identifying parameters for the model
   */
  identifyingParams() {
    return {
      model_name: this.modelName,
      ...this.invocationParams(),
    };
  }
  formatMessagesAsPrompt(messages: any) {
    return (
      messages
        .map((message: any) => {
          const messagePrompt = getAnthropicPromptFromMessage(message._getType());
          return `${messagePrompt} ${message.text}`;
        })
        .join('') + '\n\nAssistant:'
    );
  }
  async _generate(messages: BaseChatMessage[]): Promise<ChatResult> {
    const params = this.invocationParams();
    const res: any = await this.completionWithRetry({
      ...params,
      prompt: this.formatMessagesAsPrompt(messages),
    });

    const generations: any = [
      {
        text: res.response,
        message: new AIChatMessage(res.response),
      },
    ];
    return {
      generations,
    };
  }
  async completionWithRetry(request: any) {
    const makeCompletionRequest = async () => {
      const res: any = await axios.post(process.env.CHATGLM_6B_SERVER_URL ?? 'http://118.31.75.7:8000', request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res;
    };
    return this.caller.call(makeCompletionRequest).then(res => {
      return res.data;
    });
  }
  _llmType() {
    return 'chatglm';
  }
  _combineLLMOutput(...llmOutputs: any) {
    return llmOutputs.reduce(
      (acc: any, llmOutput: any) => {
        if (llmOutput && llmOutput.tokenUsage) {
          acc.tokenUsage.completionTokens += llmOutput.tokenUsage.completionTokens ?? 0;
          acc.tokenUsage.promptTokens += llmOutput.tokenUsage.promptTokens ?? 0;
          acc.tokenUsage.totalTokens += llmOutput.tokenUsage.totalTokens ?? 0;
        }
        return acc;
      },
      {
        tokenUsage: {
          completionTokens: 0,
          promptTokens: 0,
          totalTokens: 0,
        },
      },
    );
  }
}
function getAnthropicPromptFromMessage(type: string) {
  switch (type) {
    case 'ai':
      return '\n\nAssistant:';
    case 'human':
      return '\n\nHuman:';
    case 'system':
      return '';
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}
