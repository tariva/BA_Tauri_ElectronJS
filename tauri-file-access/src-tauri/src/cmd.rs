use std::env::current_dir;
use std::fs;
use std::io::Read;
use std::io::Write;
use std::path::Path;
use std::path::PathBuf;

#[derive(serde::Deserialize)]
pub struct ReadFileArgs {
    path: PathBuf,
}

#[derive(serde::Deserialize)]
pub struct WriteFileArgs {
    path: PathBuf,
    content: String,
}

#[derive(serde::Deserialize)]
pub struct ReadDirArgs {
    path: PathBuf,
}

#[derive(serde::Deserialize)]
pub struct CreateDirArgs {
    path: PathBuf,
}

#[derive(serde::Deserialize)]
pub struct RemoveDirArgs {
    path: PathBuf,
}

#[tauri::command]
pub fn read_file(args: ReadFileArgs) -> Result<String, String> {
    let mut file = fs::File::open(args.path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;
    Ok(contents)
}

#[tauri::command]
pub fn write_file(args: WriteFileArgs) -> Result<(), String> {
    let mut file = fs::File::create(args.path).map_err(|e| e.to_string())?;
    file.write_all(args.content.as_bytes())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_dir(args: ReadDirArgs) -> Result<Vec<PathBuf>, String> {
    let entries = fs::read_dir(args.path).map_err(|e| e.to_string())?;
    let paths = entries
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .collect();
    Ok(paths)
}

#[tauri::command]
pub fn create_dir(args: CreateDirArgs) -> Result<(), String> {
    fs::create_dir(args.path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_dir(args: RemoveDirArgs) -> Result<(), String> {
    fs::remove_dir_all(args.path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_cwd() -> Result<String, String> {
    match current_dir() {
        Ok(cwd) => Ok(cwd.to_string_lossy().to_string()),
        Err(e) => Err(e.to_string()),
    }
}
#[tauri::command]
pub fn path_exists(path: String) -> bool {
    Path::new(&path).exists()
}
