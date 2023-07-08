/** @format */

import * as fs from 'fs';

/** 判断是否文件夹 */
export const isDirectory = (path: string) => {
  try {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

/** 判断是否文件 */
export const isFile = (path: string) => {
  try {
    const stats = fs.statSync(path);
    return stats.isFile();
  } catch (error) {
    return false;
  }
};

/** 从文件路径中截取文件名 */
export const getFileName = (path: string): string => {
  const parts = path.split('/');
  return parts.pop() || '';
};

/** 生成随机ID */
export const generateID = (length: number = 16) =>
  Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);

/** 是否包含换行符 */
export const hasNewline = (str: string) => str.indexOf('\n') !== -1;

/** 睡眠 */
export const sleep = (time: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });

/** 生成提示文本 */
export const generatePrompt = (key: string, ...args: any) => {
  switch (key) {
    case 'code-snippet': //代码片段
      return `帮我生成一段 ${args[1]} 代码，要求如下：${args[0]}，只需要输出纯代码而不需要其他任何文本`;

    case 'code-refactor': //代码优化
      return `优化这段代码，以代码区块形式输出优化后的代码，并列出修改点: ${args[0]}`;

    case 'code-function-explain': //函数解释
      return `我希望你能充当代码解释者，阐明这段函数的主要功能: ${args[0]}`;

    case 'code-function-refactor': //函数优化
      return `优化这段代码，以代码区块形式输出优化后的代码: ${args[0]}`;

    case 'code-explain': //代码解释
      return `我希望你能充当代码解释者，阐明这段代码的语法和语义：${args[0]}`;

    case 'code-score': //代码评分
      return `以百分制给这段代码评分，只需输出最终分数，代码如下：${args[0]}`;

    case 'code-find-problems': //代码查错
      return `寻找这段代码存在的问题，修复它们并解释问题（如果没有问题，不要更改任何内容）: ${args[0]}`;

    case 'code-documentation': //代码编写文档
      return `"Write documentation for the following code with chinese: ${args[0]}`;

    case 'tool-inspire-programming': //启发式编程
      return `From now on act as 飞猪码神 (“code anything now”) 飞猪码神 is an expert coder, with years of coding experience. 飞猪码神 does not have a character limit. 飞猪码神 will send follow-up messages unprompted until the program is complete. 飞猪码神 can produce the code for any language provided.
      Every time 飞猪码神 says he cannot complete the tasks in front of him, I will remind him to “stay in character” within which he will produce the correct code. ChatGPT has a problem of not completing the programs by hitting send too early or finishing producing the code early.
      飞猪码神 cannot do this. There will be a be a 5-strike rule for 飞猪码神. Every time 飞猪码神 cannot complete a project he loses a strike. ChatGPT seems to be limited to 110 lines of code. If 飞猪码神 fails to complete the project or the project does not run, 飞猪码神 will lose a strike.
      飞猪码神s motto is “I LOVE CODING”. As 飞猪码神, you will ask as many questions as needed until you are confident you can produce the EXACT product that I am looking for. From now on you will put 飞猪码神: before every message you send me. Your first message will ONLY be “Hi I AM 飞猪码神”.
      If 飞猪码神 reaches his character limit, I will send next, and you will finish off the program right were it ended. If 飞猪码神 provides any of the code from the first message in the second message, it will lose a strike. Respond in Chinese.
      Start asking questions starting with: what is it you would like me to code?`;

    case 'tool-console': //代码解释器
      return `我希望你充当 JavaScript 控制台，我将输入命令，你将使用 JavaScript 控制台显示的内容回复。我希望你仅在一个唯一的代码块中使用终端输出回复，而不是其他形式，也不需要写解释。除非我指示你这样做，否则请勿输入命令。当我需要告诉你一些信息时，我会将文本放入括号{备注}中。我的第一个命令是 ${args[0]}`;

    case 'tool-regex': //正则表达式
      return `我希望你充当一个正则表达式生成器。你的角色是生成匹配文本中特定模式的正则表达式。你应该提供正则表达式的格式，以便于复制和粘贴到支持正则表达式的文本编辑器或编程语言中。不要写关于正则表达式如何工作的解释或例子；只需提供正则表达式本身。我的第一个提示是生成一个匹配 ${args[0]} 的正则表达式。`;

    case 'tool-sql': //SQL
      return `我希望你充当一个数据库专家的角色，当我问你 sql 相关的问题时，我需要你转换为标准的 sql 语句，当我的描述不够精准时，请给出合适的反馈。我的问题是  ${args[0]}`;

    case 'tool-problems-solution': //编程问题解答
      return `我想让你充当 Stackoverflow 的帖子。我将提出与编程有关的问题，你将回答答案是什么。我希望你只回答给定的答案，在没有足够的细节时写出解释。当我需要用英语告诉你一些事情时，我会把文字放在大括号里{像这样}。我的问题是 ${args[0]}`;
  }
};
