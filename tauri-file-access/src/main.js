import { createTauriCommands } from "./tauri-commands.js";

// Create custom Tauri commands that will be called from the frontend
const tauriCommands = createTauriCommands();

const {
  readAsync,
  writeAsync,
  readdirAsync,
  mkdirAsync,
  deleteDir,
  join,
  path_exists,
  dirname,
  getRootDir,
} = await tauriCommands;

const RESULTS_FILE = `results.csv`;
const PARALLEL_WORKERS = 100;
const RERUNS = 5;
const ROOT = await getRootDir();
console.log(ROOT);
const FIXTURES_PATH = await join(ROOT, "fixtures");
const SOURCES_PATH = await join(ROOT, "source-files");
const FILES = 1000;
console.log(SOURCES_PATH);
/**
 *
 * @param {string} folderName
 */
const readFolderContent = async (folderName) => {
  const start = Date.now();
  const sourceFolder = await join(FIXTURES_PATH, folderName);
  const files = await readdirAsync(sourceFolder);
  console.log(files);
  const end = Date.now();

  const time = end - start;

  return [files, time];
};

/**
 *
 * @param {string[]} files
 */
const readSequentially = async (files) => {
  console.log(readSequentially);
  console.log(files);
  const start = Date.now();

  for (let i = 0; i < files.length; i++) {
    await readAsync(files[i], "utf-8");
  }

  const end = Date.now();
  const time = end - start;

  return [files.length, time];
};

/**
 *
 * @param {string[]} files
 */
const read = async (files) => {
  if (files.length <= 0) {
    return;
  }

  const file = files.pop();

  await readAsync(file, "utf-8");

  return read(files);
};

/**
 * @param {string[]} files
 */
const readConcurrently = async (files) => {
  const totalFiles = files.length;
  const start = Date.now();

  const workers = [];

  for (let i = 0; i < PARALLEL_WORKERS; i++) {
    workers.push(read(files));
  }

  await Promise.all(workers);

  const end = Date.now();
  const time = end - start;

  return [totalFiles, time];
};

/**
 *
 * @param {string} content
 * @param {string[]} files
 */
const writeFile = async (files, content) => {
  if (files.length <= 0) {
    return;
  }

  const filename = files.pop();

  await writeAsync(filename, content, "utf-8");

  return writeFile(files, content);
};

/**
 * @param {string[]} files
 * @param {string} content
 */
const writeConcurrently = async (files, content) => {
  const totalFiles = files.length;
  const start = Date.now();

  const workers = [];

  for (let i = 0; i < PARALLEL_WORKERS; i++) {
    workers.push(writeFile(files, content));
  }

  await Promise.all(workers);

  const end = Date.now();
  const time = end - start;

  return [totalFiles, time];
};

/**
 * Creates the files used for reading later concurrently
 * @param {string} folderName
 */
const writeFiles = async (folderName) => {
  const start = Date.now();
  const targetFolder = await join(FIXTURES_PATH, folderName);

  try {
    await mkdirAsync(targetFolder);
  } catch (e) {
    console.log(e);
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

  const end = Date.now();

  const time = end - start;

  return [files, time];
};

const deleteFixtures = async () => {
  const exists = await path_exists(FIXTURES_PATH);

  if (exists) {
    try {
      await deleteDir(FIXTURES_PATH);
    } catch (e) {
      console.log(e);
    }
  }

  await mkdirAsync(FIXTURES_PATH);
};

/**
 *
 * @param {string} fileSize
 * @returns {[number,number,number,number]}
 */
const benchmark = async (fileSize) => {
  await deleteFixtures();
  const [, timeToWrite] = await writeFiles(fileSize);

  // Read files in different modes
  const [files, timeToList] = await readFolderContent(fileSize);
  const [, seqTime] = await readSequentially(files);
  const [, parallelTime] = await readConcurrently(files);

  return [timeToWrite, timeToList, seqTime, parallelTime];
};

/**
 * Results is an array of arrays:
 * [[t1,t2,t3, ...], [t1, t2, t3, ...], ...]
 *
 * Need to calculate the average of each t1, t2, t3...
 */
const calculateAverage = (results) => {
  const total = results.reduce((sum, result) => {
    for (let i = 0; i < result.length; i++) {
      if (isNaN(sum[i])) {
        sum[i] = 0;
      }

      sum[i] += result[i];
    }
    return sum;
  }, []);

  const final = total.map((value) => {
    return value / results.length;
  });

  return final;
};

const run = async () => {
  document.getElementById("start").setAttribute("disabled", "disabled");
  const fileSizes = ["4k", "1mb"];

  while (fileSizes.length > 0) {
    const size = fileSizes.shift();
    const results = [];

    for (let i = 0; i < RERUNS; i++) {
      document.getElementById(
        "status"
      ).textContent = `Running benchmark for size ${size} (${i})`;
      const result = await benchmark(size);

      results.push(result);
    }

    const [timeToWrite, timeToList, seqTime, parallelTime] =
      calculateAverage(results);

    await writeAsync(
      await join(ROOT, "..", `tauri-${size}-${RESULTS_FILE}`),
      `Action,Time elapsed (ms)
Write files,${timeToWrite}
Read dir,${timeToList}
Sequential read,${seqTime}
Parallel read,${parallelTime}
`,
      "utf-8"
    );
  }

  document.getElementById("start").removeAttribute("disabled");
  document.getElementById("status").textContent = `Done`;
};

document.getElementById("start").addEventListener("click", run);
