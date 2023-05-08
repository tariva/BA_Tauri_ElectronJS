import { invoke } from "@tauri-apps/api/tauri";
import { join, dirname } from "@tauri-apps/api/path";

export function createTauriCommands() {
  const readAsync = async (path) => {
    return await invoke("read_file", { args: { path } });
  };

  const writeAsync = async (path, content) => {
    return await invoke("write_file", { args: { path, content } });
  };

  const readdirAsync = async (path) => {
    return await invoke("read_dir", { args: { path } });
  };

  const path_exists = async (path) => {
    return await invoke("path_exists", { path });
  };

  const mkdirAsync = async (path) => {
    return await invoke("create_dir", { args: { path } });
  };

  const deleteDir = async (path) => {
    return await invoke("remove_dir", { args: { path } });
  };

  const getRootDir = async () => {
    const ROOT = await invoke("get_cwd");
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
