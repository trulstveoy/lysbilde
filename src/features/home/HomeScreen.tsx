import Button from "../../components/Button";
import SlideThumbnail from "../../components/SlideThumbnail";
import type { ProjectSummary } from "../../domain/project";

type HomeScreenProps = {
  onNewProject: () => void;
  onOpenProject: (id: string) => void;
  projects: ProjectSummary[];
};

function HomeScreen({
  onNewProject,
  onOpenProject,
  projects,
}: HomeScreenProps) {
  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <h1>Lysbilde</h1>
          <p>Organize and present HTML-based slide decks.</p>
        </div>
        <Button onClick={onNewProject} variant="primary">
          New presentation
        </Button>
      </header>

      <section aria-labelledby="presentations-heading">
        <p className="section-eyebrow">Library</p>
        <h2 className="section-title" id="presentations-heading">
          Presentations
        </h2>
        <div className="project-grid">
          {projects.map((project, index) => (
            <button
              className="project-card"
              key={project.id}
              onClick={() => onOpenProject(project.id)}
              type="button"
            >
              <div className="project-card-thumb">
                <SlideThumbnail index={index} />
              </div>
              <div className="project-card-body">
                <strong>{project.title}</strong>
                <span>
                  {project.slideCount} slides · Updated {project.updatedAt}
                </span>
              </div>
            </button>
          ))}
          <button
            className="project-card project-card--new"
            onClick={onNewProject}
            type="button"
          >
            <span className="new-project-mark">+</span>
            <span>New presentation</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default HomeScreen;
