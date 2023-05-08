// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use serde_json::from_str;
use tauri::Manager;
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct Message {
  id: usize,
  start: f64,
  duration: f64,
}

fn main() {
    tauri::Builder::default()
       .setup(|app| {
        let handle = app.handle();
            // listen to the `asynchronous-message` (emitted on any window)
            app.listen_global("asynchronous-message", move |event| {
                let payload: &str = event.payload().unwrap();
                let message: Message = from_str(payload).expect("failed to deserialize payload");
                // emit the `asynchronous-reply` event to all webview windows on the frontend
                handle.emit_all("asynchronous-reply", &message).expect("failed to emit event");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
