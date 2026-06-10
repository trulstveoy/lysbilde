use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

use crate::html_metadata::{fallback_title, title_from_html_file};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DisplaySettings {
    pub mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnnotationLayerRef {
    pub slide_id: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum SlideAnnotation {
    #[serde(rename = "sticky-note")]
    StickyNote {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        text: String,
        color: String,
    },
    #[serde(rename = "text-box")]
    TextBox {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        text: String,
        color: String,
    },
    #[serde(rename = "rectangle")]
    Rectangle {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        fill_color: String,
        color: String,
    },
    #[serde(rename = "arrow")]
    Arrow {
        id: String,
        x: f64,
        y: f64,
        end_x: f64,
        end_y: f64,
        stroke_width: f64,
        color: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Slide {
    pub id: String,
    pub title: String,
    pub file_path: String,
    pub thumbnail_path: Option<String>,
    #[serde(default)]
    pub missing: bool,
    #[serde(default)]
    pub annotations: Vec<SlideAnnotation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
    pub slides: Vec<Slide>,
    pub display_settings: DisplaySettings,
    #[serde(default)]
    pub annotations: Vec<AnnotationLayerRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSummary {
    pub id: String,
    pub title: String,
    pub slide_count: usize,
    pub updated_at: String,
    pub thumbnail_path: Option<String>,
}

fn now_id() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .to_string()
}

fn now_stamp() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        .to_string()
}

fn projects_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("projects");
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    Ok(dir)
}

fn project_dir(app: &AppHandle, id: &str) -> Result<PathBuf, String> {
    Ok(projects_dir(app)?.join(id))
}

fn project_file(app: &AppHandle, id: &str) -> Result<PathBuf, String> {
    Ok(project_dir(app, id)?.join("project.json"))
}

fn read_project_file(path: &Path) -> Result<Project, String> {
    let content = fs::read_to_string(path).map_err(|error| error.to_string())?;
    serde_json::from_str(&content).map_err(|error| error.to_string())
}

fn write_project_file(app: &AppHandle, project: &Project) -> Result<Project, String> {
    let dir = project_dir(app, &project.id)?;
    fs::create_dir_all(dir.join("thumbnails")).map_err(|error| error.to_string())?;
    let content = serde_json::to_string_pretty(project).map_err(|error| error.to_string())?;
    fs::write(dir.join("project.json"), content).map_err(|error| error.to_string())?;
    Ok(project.clone())
}

fn with_file_status(mut project: Project) -> Project {
    for slide in &mut project.slides {
        slide.missing = !Path::new(&slide.file_path).exists();
    }
    project
}

#[tauri::command]
pub fn list_projects(app: AppHandle) -> Result<Vec<ProjectSummary>, String> {
    let dir = projects_dir(&app)?;
    let mut projects = Vec::new();

    for entry in fs::read_dir(dir).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path().join("project.json");
        if !path.exists() {
            continue;
        }

        let project = read_project_file(&path)?;
        projects.push(ProjectSummary {
            id: project.id,
            title: project.title,
            slide_count: project.slides.len(),
            updated_at: project.updated_at,
            thumbnail_path: project
                .slides
                .first()
                .and_then(|slide| slide.thumbnail_path.clone()),
        });
    }

    projects.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(projects)
}

#[tauri::command]
pub fn create_project(app: AppHandle, title: String) -> Result<Project, String> {
    let trimmed = title.trim();
    if trimmed.is_empty() {
        return Err("Project title is required".to_string());
    }

    let timestamp = now_stamp();
    let project = Project {
        id: now_id(),
        title: trimmed.to_string(),
        created_at: timestamp.clone(),
        updated_at: timestamp,
        slides: Vec::new(),
        display_settings: DisplaySettings {
            mode: "embedded".to_string(),
        },
        annotations: Vec::new(),
    };

    write_project_file(&app, &project)
}

#[tauri::command]
pub fn get_project(app: AppHandle, id: String) -> Result<Project, String> {
    let project = read_project_file(&project_file(&app, &id)?)?;
    Ok(with_file_status(project))
}

#[tauri::command]
pub fn update_project(app: AppHandle, mut project: Project) -> Result<Project, String> {
    project.updated_at = now_stamp();
    write_project_file(&app, &project)
}

#[tauri::command]
pub fn delete_project(app: AppHandle, id: String) -> Result<(), String> {
    let dir = project_dir(&app, &id)?;
    if dir.exists() {
        fs::remove_dir_all(dir).map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn import_html_slides(
    app: AppHandle,
    project_id: String,
    file_paths: Vec<String>,
) -> Result<Project, String> {
    let mut project = get_project(app.clone(), project_id)?;

    for file_path in file_paths {
        let path = PathBuf::from(&file_path);
        let title = title_from_html_file(&path).unwrap_or_else(|| fallback_title(&path));
        project.slides.push(Slide {
            id: now_id(),
            title,
            file_path,
            thumbnail_path: None,
            missing: !path.exists(),
            annotations: Vec::new(),
        });
    }

    update_project(app, project)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deserializes_project_without_slide_annotations() {
        let json = r#"{
          "id": "p1",
          "title": "Deck",
          "createdAt": "1",
          "updatedAt": "1",
          "slides": [
            {
              "id": "s1",
              "title": "Slide",
              "filePath": "/tmp/slide.html",
              "thumbnailPath": null
            }
          ],
          "displaySettings": { "mode": "embedded" }
        }"#;

        let project: Project = serde_json::from_str(json).expect("project parses");

        assert_eq!(project.slides[0].annotations.len(), 0);
        assert_eq!(project.annotations.len(), 0);
    }
}
