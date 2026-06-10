mod html_metadata;
mod project_store;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            project_store::list_projects,
            project_store::create_project,
            project_store::get_project,
            project_store::update_project,
            project_store::delete_project,
            project_store::import_html_slides,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
