# Benchmarks for comparison between ElectronJS and Tauri

-Prerequisites
NodeJs And everything listed at:
https://tauri.app/v1/guides/getting-started/prerequisites/

## CPU
The CPU challenge measures how much time it takes to calculate all the prime numbers under XXXX wihtout blocking the UI and reporting how many have been found so far.



### Electron

To run the Electron tests:

1. Open a terminal into `cpu\`.
1. Run `npm install` to install all dependencies
1. Run `npm run make` to create the packaged version of the application
1. Run `out\electron-win32-x64\electron.exe` 
1. Press the "start" button
1. Once the challenge is finished, the average should appear on the screen

### Tauri 

To run the Tauri tests:

1. Open a terminal into `tauri-cpu\`.
1. Run `npm install` to install all dependencies
1. Run `npm run tauri build` to build the project
1. Run `` Todo 
1. Press the "start" button
1. Once the challenge is finished, the average should appear on the screen

## File access

The file access tests currently measures the speed for the following scenarios:

- List the contents of a folder with 10,000 files
- Read the content of those 10,000 files sequentially
- Read the content of those 10,000 files concurrently with a max of 100 files open at any given time to do not run out of file descriptors

The above tests are performed for files of 4Kb and 1MB.

The goal is to not block the UI so async/await is used in JS and Rust. In the case of sequential read the code reads one file after another without blocking.

### Electron

To run the Electron tests:

1. Open a terminal into `file-access\`.
1. Run `npm install` to install all dependencies
1. Run `npm run make` to create the packaged version of the application
1. Run `out\electron-win32-x64\electron.exe` 
1. Press the "start" button
1. Once the challenge is finished, the text in the text area should change to "Done" and `files-access` should have the following 2 new files:

```
electron-1mb-results.csv
electron-4k-results.csv
```
### Tauri 

To run the Tauri tests:

1. Open a terminal into `tauri-cpu\`.
1. Run `npm install` to install all dependencies
1. Run `npm run tauri build` to build the project
1. Run `` Todo 
1. Press the "start" button
1. Once the challenge is finished, the text in the text area should change to "Done" and `files-access` should have the following 2 new files:

```
tauri-1mb-results.csv
tauri-4k-results.csv
```


## IPC

The IPC tests measure the speed of the following scenarios:

- Renderer -> Main -> Renderer for electron using ipcMain, ipcRenderer
- WebView2 -> Rust -> WebView2 for tauri using events

The tests are "naïve". What ever number of messages you indicate will be sent
without any type of optimization (like batching or delaying to not fill the queue).

If you have a chatty IPC, you usually want to have some type of mechanism to
do this but in this challenge we are just testing "defaults".


# Acknowledgement
Code inspried by https://github.com/crossplatform-dev/xplat-challenges
