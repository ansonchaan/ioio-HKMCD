// https://medium.com/@csepulv/in-order-to-import-electron-please-try-the-following-29c58f43f86f
// const electron = window.require('electron');
// const ipc = electron.ipcRenderer;

const ipcFunc = function(){
    // check if electron exist
  try {
    const {ipcRenderer} = window.require('electron');
    return ipcRenderer;
  } catch (e) {
    // not in electron
    // use window.onMessage instead?
    // now return a fake ipcRenderer object
    const ipc = {};
  //   ipc['on'] = (key, callback) => {
  //     window.addEventListener('message', (event) => {
  //       const msg = event.data;
  //       if (typeof (msg) === "string") {
  //         try {
  //           const parsedMsg = JSON.parse(msg);
  //           if (parsedMsg.key === key) {
  //             callback(event, parsedMsg.msg);
  //           }
  //         } catch (e) {
  //           // non-json, ff
  //         }
  //       }
  //     });
  //   }
  //   ipc['once'] = ipc['on'];
    ipc['send'] = (key, msg) => {
      // sender page class list
      // const senderEl = window.document.querySelector('#root > div');
      // if (!senderEl) return;
      // const senderClassList = senderEl.classList;
      // let receiver = '';
      // if (senderClassList.contains('ex9-1b-content')) {
      //   receiver = '/exhibition_9.1a';
      // } else if (senderClassList.contains('ex9-3b-content')) {
      //   receiver = '/exhibition_9.3a';
      // }
      // const parent = window.parent;
      // if (parent) {
      //   const stringifyMsg = JSON.stringify({
      //     key: key,
      //     receiver: receiver,
      //     msg: msg
      //   });
      //   parent.postMessage(stringifyMsg, '*');
      // }
    }

    // for use in outermost App.js
    ipc['isFake'] = true;

    return ipc;
  }
}

const ipc = ipcFunc();

export default ipc;