// Create web worker
const THRESHOLD = 10000000;
const worker = new Worker('./worker.js');
/** @type {HTMLButtonElement} */
const start = document.getElementById('start');
/** @type {HTMLParagraphElement} */
const status = document.getElementById('status');
const results = document.getElementById('results');

const ITERATIONS = 5;

let resolver;

const onMessage = (message) => {
    // Update the UI    
    let prefix = '[Calculating]';

    if (message.data.status === 'done') {
        prefix = `[Done]`;
        start.removeAttribute('disabled');
    }

    status.innerHTML = `${prefix} Found <code>${message.data.count}</code> prime numbers in <code>${message.data.time}ms</code>`;

    if (message.data.status === 'done') {
        resolver(message.data.time);
    }
};

worker.addEventListener('message', onMessage);

const benchmark = () => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        resolver = resolve;
        worker.postMessage({ value: THRESHOLD, startTime });
    });
};

const calculate = async () => {
    start.setAttribute('disabled', 'disabled');
    let total = 0;

    for (let i = 0; i < ITERATIONS; i++) {
        const result = await benchmark();
        total += result;
    }

    const average = total / ITERATIONS;

    results.innerText = `Average time: ${average}ms`;
};

start.addEventListener('click', calculate);