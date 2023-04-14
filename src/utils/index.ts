/**
 * 生成随机ID
 *
 * @format
 */

export const generateID = (length: number = 16) =>
  Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
