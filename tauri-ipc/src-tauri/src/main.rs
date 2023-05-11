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

            // Listen to the `asynchronous-message` (emitted on any window)
            app.listen_global("asynchronous-message", move |event| {
                match event.payload() {
                    Some(payload) => {
                        match from_str::<Message>(payload) {
                            Ok(message) => {
                                // Emit the `asynchronous-reply` event to all webview windows on the frontend
                                if let Err(e) = handle.emit_all("asynchronous-reply", &message) {
                                    eprintln!("Failed to emit event: {}", e);
                                }
                            }
                            Err(e) => eprintln!("Failed to deserialize payload: {}", e),
                        }
                    }
                    None => eprintln!("Received event with no payload"),
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
