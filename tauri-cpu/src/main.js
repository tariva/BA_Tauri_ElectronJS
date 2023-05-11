// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

// Create web worker
const THRESHOLD = 10000000;
const worker = new Worker("worker.js");
/** @type {HTMLButtonElement} */
const start = document.getElementById("start");
/** @type {HTMLParagraphElement} */
const statusEl = document.getElementById("status");
const results = document.getElementById("results");

const ITERATIONS = 15;

let resolver;
// on document load
document.addEventListener("DOMContentLoaded", () => {
  statusEl.innerHTML = "Ready to start";
  results.innerHTML = "Results:";
});
const onMessage = (message) => {
  // Update the UI
  let prefix = "[Calculating]";

  if (message.data.status === "done") {
    prefix = `[Done]`;
    start.removeAttribute("disabled");
  }

  statusEl.innerHTML = `${prefix} Found <code>${message.data.count}</code> prime numbers in <code>${message.data.time}ms</code>`;

  if (message.data.status === "done") {
    resolver(message.data.time);
  }
};

worker.addEventListener("message", onMessage);

const benchmark = () => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    resolver = resolve;
    worker.postMessage({ value: THRESHOLD, startTime });
  });
};

const calculate = async () => {
  let total = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const result = await benchmark();
    total += result;
  }

  const average = total / ITERATIONS;

  results.innerHTML = `<br>Average time: ${average}ms`;
};
// on button click start the calculation only start once
start.addEventListener("click", () => {
  if (start.getAttribute("disabled") !== "disabled") {
    start.setAttribute("disabled", "disabled");
    statusEl.innerHTML = "Calculating...";
    calculate();
  }
});
