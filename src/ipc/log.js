import ipc from './index';

const setLogData = (data) => {
    ipc.send('setLogData', data);
}

export {
    setLogData
}