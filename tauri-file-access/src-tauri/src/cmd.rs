use std::env::current_dir;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

/// Struct to hold the path for reading a file
#[derive(serde::Deserialize)]
pub struct ReadFileArgs {
    path: PathBuf,
}

/// Struct to hold the path and content for writing to a file
#[derive(serde::Deserialize)]
pub struct WriteFileArgs {
    path: PathBuf,
    content: String,
}

/// Struct to hold the path for reading a directory
#[derive(serde::Deserialize)]
pub struct ReadDirArgs {
    path: PathBuf,
}

/// Struct to hold the path for creating a directory
#[derive(serde::Deserialize)]
pub struct CreateDirArgs {
    path: PathBuf,
}

/// Struct to hold the path for removing a directory
#[derive(serde::Deserialize)]
pub struct RemoveDirArgs {
    path: PathBuf,
}

/// Read the content of a file specified by the path in `ReadFileArgs`
#[tauri::command]
pub fn read_file(args: ReadFileArgs) -> Result<String, String> {
    let mut file = fs::File::open(args.path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;
    Ok(contents)
}

/// Write content to a file specified by the path in `WriteFileArgs`
#[tauri::command]
pub fn write_file(args: WriteFileArgs) -> Result<(), String> {
    let mut file = fs::File::create(args.path).map_err(|e| e.to_string())?;
    file.write_all(args.content.as_bytes())
        .map_err(|e| e.to_string())
}

/// Read the content of a directory specified by the path in `ReadDirArgs`
#[tauri::command]
pub fn read_dir(args: ReadDirArgs) -> Result<Vec<PathBuf>, String> {
    let entries = fs::read_dir(args.path).map_err(|e| e.to_string())?;
    let paths = entries
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .collect();
    Ok(paths)
}

/// Create a directory specified by the path in `CreateDirArgs`
#[tauri::command]
pub fn create_dir(args: CreateDirArgs) -> Result<(), String> {
    fs::create_dir(args.path).map_err(|e| e.to_string())
}

/// Remove a directory specified by the path in `RemoveDirArgs`
#[tauri::command]
pub fn remove_dir(args: RemoveDirArgs) -> Result<(), String> {
    fs::remove_dir_all(args.path).map_err(|e| e.to_string())
}

/// Get the current working directory
#[tauri::command]
pub fn get_cwd() -> Result<String, String> {
    match current_dir() {
        Ok(cwd) => Ok(cwd.to_string_lossy().to_string()),
        Err(e) => Err(e.to_string()),
    }
}

/// Check if the path exists
#[tauri::command]
pub fn path_exists(path: String) -> bool {
    Path::new(&path).exists()
}
