import { invoke } from "@tauri-apps/api/core";

import type { Project, ProjectSummary } from "./project";

const isTauriRuntime =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

type ProjectStoreState = {
  projects: Project[];
};

const memoryState: ProjectStoreState = {
  projects: [],
};

function timestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function createMemoryProject(title: string): Project {
  const now = timestamp();
  return {
    id: Date.now().toString(),
    title: title.trim(),
    createdAt: now,
    updatedAt: now,
    slides: [],
    displaySettings: { mode: "embedded" },
    annotations: [],
  };
}

function summarize(project: Project): ProjectSummary {
  return {
    id: project.id,
    title: project.title,
    slideCount: project.slides.length,
    updatedAt: project.updatedAt,
    thumbnailPath: project.slides[0]?.thumbnailPath ?? null,
  };
}

function titleFromPath(path: string) {
  const file = path.split(/[\\/]/).pop() ?? "Untitled slide";
  return file.replace(/\.html?$/i, "") || "Untitled slide";
}

export async function listProjects(): Promise<ProjectSummary[]> {
  if (isTauriRuntime) {
    return invoke<ProjectSummary[]>("list_projects");
  }

  return memoryState.projects.map(summarize);
}

export async function createProject(title: string): Promise<Project> {
  if (isTauriRuntime) {
    return invoke<Project>("create_project", { title });
  }

  const project = createMemoryProject(title);
  memoryState.projects.unshift(project);
  return project;
}

export async function getProject(id: string): Promise<Project> {
  if (isTauriRuntime) {
    return invoke<Project>("get_project", { id });
  }

  const project = memoryState.projects.find((candidate) => candidate.id === id);
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}

export async function updateProject(project: Project): Promise<Project> {
  if (isTauriRuntime) {
    return invoke<Project>("update_project", { project });
  }

  const updated = { ...project, updatedAt: timestamp() };
  const index = memoryState.projects.findIndex(
    (candidate) => candidate.id === project.id,
  );
  if (index >= 0) {
    memoryState.projects[index] = updated;
  } else {
    memoryState.projects.unshift(updated);
  }
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  if (isTauriRuntime) {
    return invoke("delete_project", { id });
  }

  memoryState.projects = memoryState.projects.filter(
    (project) => project.id !== id,
  );
}

export async function importHtmlSlides(
  projectId: string,
  filePaths: string[],
): Promise<Project> {
  if (isTauriRuntime) {
    return invoke<Project>("import_html_slides", {
      projectId,
      filePaths,
    });
  }

  const project = await getProject(projectId);
  return updateProject({
    ...project,
    slides: [
      ...project.slides,
      ...filePaths.map((filePath) => ({
        id: `${Date.now()}-${filePath}`,
        title: titleFromPath(filePath),
        filePath,
        thumbnailPath: null,
        missing: false,
      })),
    ],
  });
}
