import { createTauriCommands } from "./tauri-commands.js";

const tauriCommands = createTauriCommands();

const {
  readAsync,
  writeAsync,
  readdirAsync,
  mkdirAsync,
  deleteDir,
  join,
  path_exists,
  getRootDir,
} = await tauriCommands;

const RESULTS_FILE = `results.csv`;
const PARALLEL_WORKERS = 100;
const RERUNS = 1;
const ROOT = await getRootDir();
const FIXTURES_PATH = await join(ROOT, "fixtures");
const SOURCES_PATH = await join(ROOT, "source-files");
const FILES = 100;

async function readFolderContent(folderName) {
  const start = Date.now();
  const sourceFolder = await join(FIXTURES_PATH, folderName);
  const files = await readdirAsync(sourceFolder);

  return [files, Date.now() - start];
}

async function readSequentially(files) {
  const start = Date.now();

  for (const file of files) {
    await readAsync(file, "utf-8");
  }

  return [files.length, Date.now() - start];
}

async function readConcurrently(files) {
  const start = Date.now();
  const readPromises = Array(PARALLEL_WORKERS).fill(Promise.resolve());

  while (files.length) {
    readPromises.push(readAsync(files.pop(), "utf-8"));
  }

  await Promise.all(readPromises);

  return [FILES, Date.now() - start];
}

async function writeFiles(folderName) {
  const start = Date.now();
  const targetFolder = await join(FIXTURES_PATH, folderName);

  try {
    await mkdirAsync(targetFolder);
  } catch (e) {
    console.error(e);
  }
  const files = [];
  for (let i = 0; i < FILES; i++) {
    files.push(await join(targetFolder, `${folderName}-${i}.txt`));
  }
  const content = await readAsync(
    await join(SOURCES_PATH, `${folderName}.txt`),
    "utf-8"
  );

  await writeConcurrently(files, content);

  return [files, Date.now() - start];
}

async function writeConcurrently(files, content) {
  const start = Date.now();
  const writePromises = Array(PARALLEL_WORKERS).fill(Promise.resolve());

  while (files.length) {
    writePromises.push(writeAsync(files.pop(), content, "utf-8"));
  }

  await Promise.all(writePromises);

  return [FILES, Date.now() - start];
}

async function deleteFixtures() {
  const exists = await path_exists(FIXTURES_PATH);

  if (exists) {
    try {
      await deleteDir(FIXTURES_PATH);
    } catch (e) {
      console.error(e);
    }
  }

  await mkdirAsync(FIXTURES_PATH);
}

async function benchmark(fileSize) {
  await deleteFixtures();
  const [, timeToWrite] = await writeFiles(fileSize);
  const [files, timeToList] = await readFolderContent(fileSize);
  const [, seqTime] = await readSequentially(files);
  const [, parallelTime] = await readConcurrently(files);

  return [timeToWrite, timeToList, seqTime, parallelTime];
}

function calculateAverage(results) {
  const total = results.reduce((sum, result) => {
    return sum.map((value, i) => value + result[i]);
  }, Array(results[0].length).fill(0));

  return total.map((value) => value / results.length);
}

async function run() {
  document.getElementById("start").setAttribute("disabled", "disabled");
  const fileSizes = ["4k", "1mb"];

  for (const size of fileSizes) {
    const results = [];
    for (let i = 0; i < RERUNS; i++) {
      document.getElementById(
        "status"
      ).textContent = `Running benchmark for size ${size} (${i})`;
      results.push(await benchmark(size));
    }

    const [timeToWrite, timeToList, seqTime, parallelTime] =
      calculateAverage(results);

    await writeAsync(
      await join(ROOT, "..", `tauri-${size}-${RESULTS_FILE}`),
      `Action,Time elapsed (ms)
    rite files,${timeToWrite}
    Read dir,${timeToList}
    Sequential read,${seqTime}
    Parallel read,${parallelTime}
    `,
      "utf-8"
    );
  }

  document.getElementById("start").removeAttribute("disabled");
  document.getElementById("status").textContent = "Done";
}

document.getElementById("start").addEventListener("click", run);
