const SEND_CHANNEL = "asynchronous-message";
const RECEIVE_CHANNEL = "asynchronous-reply";
const { emit, listen } = window.__TAURI__.event;

window.comms = {
  sendMessage: (message) => emit(SEND_CHANNEL, message),
  onMessage: (handler) => listen(RECEIVE_CHANNEL, (event) => handler(event.payload)),
  clear: () => {} // No clear equivalent in the new API
};

const calculateResults = (messages, totalTime, resultElementId) => {
  const durations = messages.reduce((sum, message) => sum + message.duration, 0);
  const average = durations / messages.length;
  document.getElementById(resultElementId).innerText = `Total: ${totalTime.toFixed(2)}ms - avg message roundtrip: ${average.toFixed(2)}ms`;
};

const startBurst = () => {
  const totalMessages = parseInt(document.getElementById('messages').value);
  const messages = [];
  const startTime = Date.now();
  let received = 0;

  const onMessage = (message) => {
    const end = Date.now();
    message.duration = end - message.start;
    messages.push(message);
    received++;
  
    if (received === totalMessages) {
      calculateResults(messages, end - startTime, 'results');
    }
  };
  

  comms.onMessage(onMessage);

  for (let id = 1; id <= totalMessages; id++) {
    comms.sendMessage({ id, start: Date.now(), duration: 0 });
  }
};

const startSequential = () => {
  const totalMessages = parseInt(document.getElementById('messages').value);
  const messages = [];
  const startTime = Date.now();
  let received = 0;

  const sendMessage = (id) => {
    comms.sendMessage({ id, start: Date.now(), duration: 0 });
  };

  const onMessage = (message) => {
    if (!message) return;
  
    const end = Date.now();
    message.duration = end - message.start;
    messages.push(message);
    received++;
  
    if (received === totalMessages) {
      comms.clear();
      calculateResults(messages, end - startTime, 'results-sequential');
    } else {
      sendMessage(received + 1);
    }
  };
  
  comms.onMessage(onMessage);
  sendMessage(received + 1);
};

document.getElementById('start').addEventListener('click', startBurst);
document.getElementById('start-sequential').addEventListener('click', startSequential);
