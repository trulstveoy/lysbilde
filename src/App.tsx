import { useEffect, useState } from "react";

import "./App.css";
import TitleBar from "./components/TitleBar";
import type { Project, ProjectSummary } from "./domain/project";
import {
  createProject,
  getProject,
  importHtmlSlides,
  listProjects,
  updateProject,
} from "./domain/projectStore";
import HomeScreen from "./features/home/HomeScreen";
import ImportModal from "./features/import/ImportModal";
import NewProjectModal from "./features/project/NewProjectModal";
import ProjectScreen from "./features/project/ProjectScreen";
import PresenterScreen from "./features/presenter/PresenterScreen";

type Screen = "home" | "project" | "presenter";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function refreshProjects() {
    setProjects(await listProjects());
  }

  useEffect(() => {
    void refreshProjects();
  }, []);

  async function handleCreateProject(title: string) {
    const project = await createProject(title);
    setActiveProject(project);
    setSelectedIndex(0);
    setNewProjectOpen(false);
    setScreen("project");
    await refreshProjects();
  }

  async function handleOpenProject(id: string) {
    const project = await getProject(id);
    setActiveProject(project);
    setSelectedIndex(0);
    setScreen("project");
  }

  async function handleProjectChange(project: Project) {
    const updated = await updateProject(project);
    setActiveProject(updated);
    await refreshProjects();
  }

  async function handleImport(paths: string[]) {
    if (!activeProject) {
      return;
    }
    const updated = await importHtmlSlides(activeProject.id, paths);
    setActiveProject(updated);
    setImportOpen(false);
    await refreshProjects();
  }

  const title =
    screen === "project" || screen === "presenter"
      ? activeProject?.title ?? "Lysbilde"
      : "Lysbilde";

  return (
    <div className="desktop-frame">
      {screen !== "presenter" && <TitleBar title={title} />}
      <div className={screen === "presenter" ? "presenter-root" : "app-layout"}>
        {screen === "home" && (
          <>
            <aside aria-label="Presentation filters" className="sidebar">
              <nav className="sidebar-nav">
                <a
                  aria-current="page"
                  className="sidebar-item sidebar-item--active"
                >
                  <span className="sidebar-icon">⊞</span>
                  <span>All</span>
                  <span className="sidebar-count">{projects.length}</span>
                </a>
                <a className="sidebar-item">
                  <span className="sidebar-icon">★</span>
                  <span>Starred</span>
                </a>
                <a className="sidebar-item">
                  <span className="sidebar-icon">↺</span>
                  <span>Recent</span>
                </a>
                <a className="sidebar-item">
                  <span className="sidebar-icon">⌫</span>
                  <span>Trash</span>
                </a>
              </nav>
            </aside>
            <HomeScreen
              onNewProject={() => setNewProjectOpen(true)}
              onOpenProject={handleOpenProject}
              projects={projects}
            />
          </>
        )}
        {screen === "project" && activeProject && (
          <ProjectScreen
            onBack={() => {
              setScreen("home");
              void refreshProjects();
            }}
            onImport={() => setImportOpen(true)}
            onPresent={() => {
              setSelectedIndex(0);
              setScreen("presenter");
            }}
            onProjectChange={handleProjectChange}
            onSelectSlide={setSelectedIndex}
            project={activeProject}
            selectedIndex={selectedIndex}
          />
        )}
        {screen === "presenter" && activeProject && (
          <PresenterScreen
            currentIndex={selectedIndex}
            onExit={() => setScreen("project")}
            onIndexChange={setSelectedIndex}
            project={activeProject}
          />
        )}
      </div>
      {newProjectOpen && (
        <NewProjectModal
          onClose={() => setNewProjectOpen(false)}
          onCreate={handleCreateProject}
        />
      )}
      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

export default App;
