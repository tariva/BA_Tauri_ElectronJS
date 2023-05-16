const startBurst = () => {
  const totalMessages = parseInt(document.getElementById("messages").value);
  let received = 0;
  const startTime = Date.now();
  const messages = [];

  const onMessage = (event, arg) => {
    const end = Date.now();
    const message = arg;

    message.duration = end - message.start;
    messages.push(message);

    received++;

    if (received === totalMessages) {
      const totalTime = end - startTime;
      let durations = 0;

      comms.clear();

      for (const message of messages) {
        durations += message.duration;
      }
      const average = durations / messages.length;
      document.getElementById(
        "results"
      ).innerText = `Total: ${totalTime.toFixed(
        2
      )}ms - avg message roundtrip: ${average.toFixed(2)}ms`;
    }
  };

  comms.onMessage(onMessage);

  for (let id = 1; id <= totalMessages; id++) {
    const message = { id, start: Date.now(), duration: 0 };

    comms.sendMessage(message);
  }
};

document.getElementById("start").addEventListener("click", startBurst);

const startSequential = () => {
  const totalMessages = parseInt(document.getElementById("messages").value);
  let received = 0;
  const messages = [];
  const startTime = performance.now();

  const sendMessage = (id) => {
    const message = { id, start: performance.now(), duration: 0 };

    comms.sendMessage(message);
  };

  const onMessage = (event, arg) => {
    const end = performance.now();
    const message = arg;

    if (!message) {
      return;
    }

    message.duration = end - message.start;
    messages.push(message);

    received++;

    if (received === totalMessages) {
      const totalTime = end - startTime;
      let durations = 0;

      // comms.clear();

      for (const message of messages) {
        durations += message.duration;
      }
      const average = durations / messages.length;
      document.getElementById(
        "results-sequential"
      ).innerText = `Total: ${totalTime.toFixed(
        2
      )}ms - avg message roundtrip: ${average.toFixed(2)}ms`;
    } else {
      sendMessage(received + 1);
    }
  };

  comms.onMessage(onMessage);

  sendMessage(received + 1);
};

document
  .getElementById("start-sequential")
  .addEventListener("click", startSequential);
