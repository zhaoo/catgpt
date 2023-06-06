/** @format */

(function () {
  const vscode = acquireVsCodeApi(); //vscode方法

  /** 角色 */
  const AI_USERINFO = {
    avatar: 'https://gw.alicdn.com/imgextra/i2/O1CN01QyCxlE1RF92i5wswn_!!6000000002081-0-tps-168-168.jpg',
    nickname: 'CatGPT',
  };
  const USER_USERINFO = {
    avatar: 'https://gw.alicdn.com/imgextra/i3/O1CN01CRKCLh1dMGbjhCL1W_!!6000000003721-0-tps-147-150.jpg',
    nickname: 'User',
  };

  /** 代码块修复 */
  function fixCodeBlocks(content) {
    const REGEX_CODEBLOCK = new RegExp('```', 'g');
    const matches = content.match(REGEX_CODEBLOCK);
    const count = matches ? matches.length : 0;
    if (count % 2 === 0) {
      return content;
    } else {
      return content.concat('\n```');
    }
  }

  /** 代码高亮初始化 */
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, _lang) {
      return hljs.highlightAuto(code).value;
    },
    langPrefix: 'hljs language-',
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false,
  });

  /** 生成模板 */
  const generateTemplate = ({type, content, key, user}) => {
    const {nickname, avatar} = JSON.parse(user || '{}');
    return `
      <div class="chat-wrapper ${type}" ${key && 'id="' + key + '"'}>
        <div class="chat-user">
          <img class="chat-avatar" src="${type === 'ai' ? AI_USERINFO.avatar : avatar || USER_USERINFO.avatar}" />
          <span class="chat-nickname">${
            type === 'ai' ? AI_USERINFO.nickname : nickname || USER_USERINFO.nickname
          }</span>
        </div>
        <p class="chat-answer chat-streaming">${content}</p>
      </div>
    `;
  };

  /** 绑定事件 */
  document.getElementById('chat-search').addEventListener('click', () => handleSearch()); //搜索按钮
  document.getElementById('chat-clear').addEventListener('click', () => handleClear()); //清空按钮
  document.getElementById('chat-input').addEventListener('keyup', e => e.key === 'Enter' && handleSearch()); //输入框回车

  /** 收到消息 */
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'ask': {
        addChat({type: 'user', ...message.value});
        break;
      }
      case 'answer': {
        addChat({type: 'ai', ...message.value});
        break;
      }
    }
  });

  /** 绑定搜索 */
  const handleSearch = () => {
    const inputNode = document.getElementById('chat-input');
    const prompt = inputNode.value;
    inputNode.value = '';
    vscode.postMessage({type: 'search', value: prompt});
  };

  /** 清空记录 */
  const handleClear = () => {
    const containerNode = document.getElementById('chat-container');
    containerNode.innerHTML = '';
  };

  /** 添加消息 */
  const addChat = ({type, content, key, done, user}) => {
    //代码处理
    const markedContent = marked.parse(fixCodeBlocks(content));

    //插入节点
    const node = document.getElementById(key);
    const answerNode = node && node.getElementsByClassName('chat-answer')[0];
    if (node) {
      answerNode.innerHTML = markedContent;
    } else {
      const containerNode = document.getElementById('chat-container');
      const newNode = document.createElement('div');
      newNode.innerHTML = generateTemplate({type, content: markedContent, key, user});
      containerNode.appendChild(newNode);
    }

    if (done) {
      answerNode.classList.remove('chat-streaming'); //干掉Loading
      //复制代码
      const preNodes = document.querySelectorAll('pre');
      preNodes.forEach(preNode => {
        const codeText = preNode.querySelector('code').innerText;
        preNode.insertAdjacentHTML('afterbegin', `<a class="chat-copy">复制</a>`);
        const copyNode = preNode.querySelector('.chat-copy');
        copyNode.addEventListener('click', e => {
          e.preventDefault();
          navigator.clipboard.writeText(codeText);
          vscode.postMessage({type: 'copy', value: codeText});
        });
      });
    }
  };
})();
