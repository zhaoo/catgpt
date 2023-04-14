/** @format */

/** 角色 */
const ROLE_MAP = {
  ai: {
    avatar: 'https://gw.alicdn.com/imgextra/i4/O1CN01vEyvLV1YGFJ2izPks_!!6000000003031-0-tps-200-200.jpg',
    nickname: 'CatGPT',
  },
  user: {
    avatar: 'https://gw.alicdn.com/imgextra/i2/O1CN01QyCxlE1RF92i5wswn_!!6000000002081-0-tps-168-168.jpg',
    nickname: 'User',
  },
};

(function () {
  const vscode = acquireVsCodeApi(); //vscode方法

  document.getElementById('search-button').addEventListener('click', () => handleSearch()); //按钮点击
  document.getElementById('search-input').addEventListener('keyup', e => e.keyCode === 13 && handleSearch()); //回车

  /** 收到消息 */
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'answer': {
        const {content, key} = message.value;
        addChat({type: 'ai', content, key});
        break;
      }
    }
  });

  /** 生成随机ID */
  const generateID = (length = 16) => Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);

  /** 绑定搜索 */
  const handleSearch = () => {
    const inputNode = document.getElementById('search-input');
    const question = inputNode.value;
    inputNode.value = '';
    vscode.postMessage({type: 'question', value: question});
    addChat({type: 'user', content: question, key: generateID()});
  };

  /** 生成模板 */
  const generateTemplate = ({type, content, key}) => `
    <div class="chat-wrapper ${type}" ${key && 'id="' + key + '"'}>
      <div class="chat-user">
        <img class="chat-avatar" src="${ROLE_MAP[type]['avatar']}" />
        <span class="chat-nickname">${ROLE_MAP[type]['nickname']}</span>
      </div>
      <p class="chat-answer">${content}</p>
    </div>
  `;

  /** 添加消息 */
  const addChat = ({type, content, key}) => {
    const node = document.getElementById(key);
    if (node) {
      const answerNode = node.getElementsByClassName('chat-answer')[0];
      answerNode.innerText += content;
    } else {
      const containerDom = document.getElementById('chat-container');
      const newNode = document.createElement('div');
      newNode.innerHTML = generateTemplate({type, content, key});
      containerDom.appendChild(newNode);
    }
  };
})();
