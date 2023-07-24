/** @format */

/** 角色 */
const AI_USERINFO = {
  avatar: 'https://gw.alicdn.com/imgextra/i1/O1CN01Kcr5fj24kXE9Q4mtS_!!6000000007429-2-tps-1024-1024.png',
  nickname: 'CatGPT',
};
const USER_USERINFO = {
  avatar: 'https://gw.alicdn.com/imgextra/i2/O1CN01ToZ4eO1DVimdLs9Nq_!!6000000000222-2-tps-1024-1024.png',
  nickname: '匿名用户',
};

(function () {
  const vscode = acquireVsCodeApi(); //vscode方法
  const searchBtnNode = document.getElementById('chat-search'); //搜索按钮
  const cancelNode = document.getElementById('chat-cancel'); //取消按钮

  /** 输出控制 */
  function OutputControl() {
    this.status = 'init'; //init:初始化、processing:输出中、finished:输出完成
  }
  //开始输出
  OutputControl.prototype.start = function (callback) {
    this.status = 'processing';
    searchBtnNode.disabled = true;
    cancelNode.style.display = 'block';
    callback && callback();
  };
  //结束输出
  OutputControl.prototype.end = function (callback) {
    this.status = 'finished';
    searchBtnNode.disabled = false;
    cancelNode.style.display = 'none';
    callback && callback();
  };
  //清空记录
  OutputControl.prototype.clear = function (callback) {
    this.status = 'init';
    searchBtnNode.disabled = false;
    cancelNode.style.display = 'none';
    vscode.postMessage({type: 'cancel'});
    callback && callback();
  };

  const outputControl = new OutputControl(); //输出控制实例

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
  const generateTemplate = ({type, content, key, user, ai = {}}) => {
    const {nickname, avatar} = JSON.parse(user || '{}');
    const {nickname: aiNickname, avatar: aiAvatar} = ai;
    return `
      <div class="chat-wrapper ${type}" ${key && 'id="' + key + '"'}>
        <div class="chat-user">
          <img class="chat-avatar" src="${
            type === 'ai' ? aiAvatar || AI_USERINFO.avatar : avatar || USER_USERINFO.avatar
          }" />
          <span class="chat-nickname">${
            type === 'ai' ? aiNickname || AI_USERINFO.nickname : nickname || USER_USERINFO.nickname
          }</span>
        </div>
        <p class="chat-answer chat-streaming">${content}</p>
      </div>
    `;
  };

  /** 绑定事件 */
  document.getElementById('chat-search').addEventListener('click', () => handleSearch()); //搜索按钮
  document.getElementById('chat-clear').addEventListener('click', () => handleClear()); //清空按钮
  document.getElementById('chat-cancel').addEventListener('click', () => handleCancle()); //停止按钮
  document.getElementById('chat-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      handleSearch();
      return false;
    }
  }); //输入框回车

  /** 绑定消息 */
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'ask': {
        handleOutput({type: 'user', ...message.value});
        break;
      }
      case 'answer': {
        handleOutput({type: 'ai', ...message.value});
        break;
      }
    }
  });

  /** 按钮搜索 */
  const handleSearch = () => {
    const inputNode = document.getElementById('chat-input');
    const prompt = inputNode.value;
    inputNode.value = '';
    vscode.postMessage({type: 'search', value: prompt});
  };

  /** 清空记录 */
  const handleClear = () => {
    outputControl.clear();
    const containerNode = document.getElementById('chat-container');
    containerNode.innerHTML = '';
  };

  /** 取消输出 */
  const handleCancle = () => {
    outputControl.end();
    vscode.postMessage({type: 'cancel'});
  };

  /** 输出消息 */
  const handleOutput = ({type, content, key, done, user, ai}) => {
    //开始输出
    outputControl.start();
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
      newNode.innerHTML = generateTemplate({type, content: markedContent, key, user, ai});
      containerNode.appendChild(newNode);
    }

    if (done) {
      //输出结束
      outputControl.end();
      answerNode.classList.remove('chat-streaming'); //干掉Loading
      const preNodes = document.querySelectorAll('pre');
      preNodes.forEach(preNode => {
        //添加按钮
        const codeText = preNode.querySelector('code').innerText;
        preNode.insertAdjacentHTML('afterbegin', `<a class="chat-copy">复制</a>`);
        preNode.insertAdjacentHTML('afterbegin', `<a class="chat-insert">插入</a>`);
        //复制事件
        const copyNode = preNode.querySelector('.chat-copy');
        copyNode.addEventListener('click', e => {
          e.preventDefault();
          navigator.clipboard.writeText(codeText);
          vscode.postMessage({type: 'copy', value: codeText});
        });
        //插入事件
        const insertNode = preNode.querySelector('.chat-insert');
        insertNode.addEventListener('click', e => {
          e.preventDefault();
          vscode.postMessage({type: 'insert', value: codeText});
        });
      });
    }
  };
})();
