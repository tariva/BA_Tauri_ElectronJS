// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod cmd;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmd::read_file,
            cmd::write_file,
            cmd::read_dir,
            cmd::create_dir,
            cmd::remove_dir,
            cmd::get_cwd,
            cmd::path_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
