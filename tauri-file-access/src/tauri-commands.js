import { invoke } from "@tauri-apps/api/tauri";
import { join, dirname } from "@tauri-apps/api/path";
import { appDataDir } from "@tauri-apps/api/path";

export function createTauriCommands() {
  const readAsync = async (path) => {
    console.log("readAsync");
    console.log(path);
    return await invoke("read_file", { args: { path } });
  };

  const writeAsync = async (path, content) => {
    console.log("writeAsync");
    return await invoke("write_file", { args: { path, content } });
  };

  const readdirAsync = async (path) => {
    console.log("readdirAsync");
    return await invoke("read_dir", { args: { path } });
  };
  const path_exists = async (path) => {
    console.log("path_exists");
    return await invoke("path_exists", { path });
  };

  const mkdirAsync = async (path) => {
    console.log("mkdirAsync");
    return await invoke("create_dir", { args: { path } });
  };

  const deleteDir = async (path) => {
    console.log("deleteDir");
    console.log(path);
    return await invoke("remove_dir", { args: { path } });
  };

  const getRootDir = async () => {
    console.log("getRootDir");
    const ROOT = await invoke("get_cwd");
    console.log(ROOT);
    return ROOT.replace("\\src-tauri", "");
  };

  return {
    readAsync,
    writeAsync,
    readdirAsync,
    mkdirAsync,
    deleteDir,
    join,
    dirname,
    getRootDir,
    path_exists,
  };
}
