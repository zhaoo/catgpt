/** @format */

/** 生成随机ID */
export const generateID = (length: number = 16) =>
  Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);

/** 生成提示文本 */
export const generatePrompt = (key: string, ...args: any) => {
  switch (key) {
    case 'code-optimize':
      return `给这段代码提出优化建议，代码如下：\n${args[0]}`;
    case 'code-explain':
      return `解释这段代码，代码如下：\n${args[0]}`;
    case 'code-score':
      return `以百分制给这段代码评分，只需输出最终分数，代码如下：\n${args[0]}`;
  }
};
