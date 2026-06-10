import Button from "../../components/Button";
import type { Project } from "../../domain/project";
import SlideGrid from "./SlideGrid";
import SlideList from "./SlideList";

type ProjectScreenProps = {
  onBack: () => void;
  onImport: () => void;
  onPresent: () => void;
  onProjectChange: (project: Project) => void;
  onSelectSlide: (index: number) => void;
  project: Project;
  selectedIndex: number;
};

function moveSlide(project: Project, from: number, to: number) {
  if (from === to || from < 0 || to < 0) {
    return project;
  }

  const slides = [...project.slides];
  const [slide] = slides.splice(from, 1);
  if (!slide) {
    return project;
  }
  slides.splice(to, 0, slide);
  return { ...project, slides };
}

function ProjectScreen({
  onBack,
  onImport,
  onPresent,
  onProjectChange,
  onSelectSlide,
  project,
  selectedIndex,
}: ProjectScreenProps) {
  function handleReorder(from: number, to: number) {
    onProjectChange(moveSlide(project, from, to));
  }

  return (
    <div className="project-screen">
      <aside className="project-sidebar">
        <Button onClick={onBack} size="small">
          Back
        </Button>
        <SlideList
          onReorder={handleReorder}
          onSelect={onSelectSlide}
          selectedIndex={selectedIndex}
          slides={project.slides}
        />
        <Button
          disabled={project.slides.length === 0}
          onClick={onPresent}
          variant="primary"
        >
          Present
        </Button>
      </aside>
      <main className="project-workspace">
        <header className="project-header">
          <div>
            <p className="section-eyebrow">Presentation</p>
            <h1>{project.title}</h1>
          </div>
          <div className="project-actions">
            <Button onClick={onImport} size="small">
              Add slides
            </Button>
          </div>
        </header>
        {project.slides.some((slide) => slide.missing) && (
          <p className="warning-banner">
            Some source files are missing. The project data was preserved.
          </p>
        )}
        <SlideGrid
          onAddSlides={onImport}
          onReorder={handleReorder}
          onSelect={onSelectSlide}
          selectedIndex={selectedIndex}
          slides={project.slides}
        />
      </main>
    </div>
  );
}

export default ProjectScreen;
