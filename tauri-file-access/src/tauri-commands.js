import { invoke } from "@tauri-apps/api/tauri";
import { join, dirname } from "@tauri-apps/api/path";
import { appDir } from "@tauri-apps/api/app";

export function createTauriCommands() {
  const readAsync = async (path) => {
    return await invoke("read_file", { path });
  };

  const writeAsync = async (path, content) => {
    return await invoke("write_file", { path, content });
  };

  const readdirAsync = async (path) => {
    return await invoke("read_dir", { path });
  };

  const mkdirAsync = async (path) => {
    return await invoke("create_dir", { path });
  };

  const deleteDir = async (path) => {
    return await invoke("remove_dir", { path });
  };

  const ROOT = dirname(appDir());

  return {
    readAsync,
    writeAsync,
    readdirAsync,
    mkdirAsync,
    deleteDir,
    join,
    dirname,
    ROOT,
  };
}
