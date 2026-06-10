import { useEffect, useMemo, useRef, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";

import Button from "../../components/Button";
import SlideViewport from "../../components/SlideViewport";
import {
  createAnnotation,
  deleteSlideAnnotation,
  recolorSlideAnnotation,
  updateSlideAnnotation,
  type AnnotationKind,
} from "../../domain/annotations";
import type { AnnotationColor, Project, Slide } from "../../domain/project";
import { moveItem, selectedIndexAfterMove } from "../../domain/reorder";
import AnnotationLayer from "../annotations/AnnotationLayer";
import AnnotationToolbar, {
  type AnnotationMode,
} from "../annotations/AnnotationToolbar";
import { useElementSize } from "../annotations/useElementSize";
import SlideGrid from "./SlideGrid";
import SlideList from "./SlideList";

type ProjectScreenProps = {
  onBack: () => void;
  onImport: () => void;
  onPresent: () => void;
  onProjectChange: (project: Project) => void;
  onSelectSlide: (index: number) => void;
  onSlideChange: (slideIndex: number, slide: Slide) => void;
  project: Project;
  selectedIndex: number;
};

function moveSlide(project: Project, from: number, to: number) {
  const slides = moveItem(project.slides, from, to);
  return slides === project.slides ? project : { ...project, slides };
}

function ProjectScreen({
  onBack,
  onImport,
  onPresent,
  onProjectChange,
  onSelectSlide,
  onSlideChange,
  project,
  selectedIndex,
}: ProjectScreenProps) {
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>("view");
  const [annotationsVisible, setAnnotationsVisible] = useState(true);
  const [annotationColor, setAnnotationColor] =
    useState<AnnotationColor>("#fff59d");
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
    null,
  );
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const viewportSize = useElementSize(viewportRef);
  const selectedSlide = project.slides[selectedIndex];
  const selectedSrc = useMemo(
    () =>
      selectedSlide && !selectedSlide.missing
        ? fileSource(selectedSlide.filePath)
        : "",
    [selectedSlide],
  );

  useEffect(() => {
    setSelectedAnnotationId(null);
  }, [selectedSlide?.id]);

  function handleReorder(from: number, to: number) {
    onProjectChange(moveSlide(project, from, to));
    onSelectSlide(
      selectedIndexAfterMove(selectedIndex, from, to, project.slides.length),
    );
  }

  function handleAnnotationChange(annotation: Slide["annotations"][number]) {
    if (!selectedSlide) {
      return;
    }
    onSlideChange(selectedIndex, updateSlideAnnotation(selectedSlide, annotation));
  }

  function handleAddAnnotation(type: AnnotationKind) {
    if (!selectedSlide) {
      return;
    }
    const annotation = createAnnotation(type, {
      id: annotationId(),
      x: 0.15,
      y: 0.15,
      color: annotationColor,
    });
    onSlideChange(selectedIndex, {
      ...selectedSlide,
      annotations: [...selectedSlide.annotations, annotation],
    });
    setSelectedAnnotationId(annotation.id);
    setAnnotationMode("annotate");
    setAnnotationsVisible(true);
  }

  function handleDeleteSelectedAnnotation() {
    if (!selectedSlide || !selectedAnnotationId) {
      return;
    }
    onSlideChange(
      selectedIndex,
      deleteSlideAnnotation(selectedSlide, selectedAnnotationId),
    );
    setSelectedAnnotationId(null);
  }

  function handleAnnotationColorChange(color: AnnotationColor) {
    setAnnotationColor(color);
    if (selectedSlide && selectedAnnotationId) {
      onSlideChange(
        selectedIndex,
        recolorSlideAnnotation(selectedSlide, selectedAnnotationId, color),
      );
    }
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
        {selectedSlide && (
          <section className="project-annotation-panel">
            <AnnotationToolbar
              color={annotationColor}
              mode={annotationMode}
              onAdd={handleAddAnnotation}
              onColorChange={handleAnnotationColorChange}
              onDeleteSelected={handleDeleteSelectedAnnotation}
              onModeChange={setAnnotationMode}
              onVisibilityChange={setAnnotationsVisible}
              selectedId={selectedAnnotationId}
              visible={annotationsVisible}
            />
            <SlideViewport
              missing={selectedSlide.missing}
              missingPath={selectedSlide.filePath}
              overlay={
                <AnnotationLayer
                  annotations={selectedSlide.annotations}
                  mode={annotationMode}
                  onChange={handleAnnotationChange}
                  onSelect={setSelectedAnnotationId}
                  selectedId={selectedAnnotationId}
                  size={viewportSize}
                  visible={annotationsVisible}
                />
              }
              ref={viewportRef}
              slideTitle={selectedSlide.title}
              src={selectedSrc}
            />
          </section>
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

function fileSource(filePath: string) {
  try {
    return convertFileSrc(filePath);
  } catch {
    return filePath;
  }
}

function annotationId() {
  return globalThis.crypto?.randomUUID?.() ?? `annotation-${Date.now()}`;
}
