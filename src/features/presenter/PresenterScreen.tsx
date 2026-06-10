import { useEffect, useMemo, useRef, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

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
import {
  nextSlideIndex,
  previousSlideIndex,
  selectSlideIndex,
} from "../../domain/presenter";
import AnnotationLayer from "../annotations/AnnotationLayer";
import AnnotationToolbar, {
  type AnnotationMode,
} from "../annotations/AnnotationToolbar";
import { useElementSize } from "../annotations/useElementSize";

type PresenterScreenProps = {
  currentIndex: number;
  onExit: () => void;
  onIndexChange: (index: number) => void;
  onSlideChange: (slideIndex: number, slide: Slide) => void;
  project: Project;
};

function fileSource(filePath: string) {
  try {
    return convertFileSrc(filePath);
  } catch {
    return filePath;
  }
}

function PresenterScreen({
  currentIndex,
  onExit,
  onIndexChange,
  onSlideChange,
  project,
}: PresenterScreenProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>("view");
  const [annotationsVisible, setAnnotationsVisible] = useState(true);
  const [annotationColor, setAnnotationColor] =
    useState<AnnotationColor>("#fff59d");
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
    null,
  );
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const viewportSize = useElementSize(viewportRef);
  const slide = project.slides[currentIndex];
  const total = project.slides.length;
  const src = useMemo(
    () => (slide && !slide.missing ? fileSource(slide.filePath) : ""),
    [slide],
  );

  function previous() {
    onIndexChange(previousSlideIndex(currentIndex, total));
  }

  function next() {
    onIndexChange(nextSlideIndex(currentIndex, total));
  }

  useEffect(() => {
    setSelectedAnnotationId(null);
  }, [slide?.id]);

  function handleAnnotationChange(annotation: Slide["annotations"][number]) {
    if (!slide) {
      return;
    }
    onSlideChange(currentIndex, updateSlideAnnotation(slide, annotation));
  }

  function handleAddAnnotation(type: AnnotationKind) {
    if (!slide) {
      return;
    }
    const annotation = createAnnotation(type, {
      id: annotationId(),
      x: 0.15,
      y: 0.15,
      color: annotationColor,
    });
    onSlideChange(currentIndex, {
      ...slide,
      annotations: [...slide.annotations, annotation],
    });
    setSelectedAnnotationId(annotation.id);
    setAnnotationMode("annotate");
    setAnnotationsVisible(true);
  }

  function handleDeleteSelectedAnnotation() {
    if (!slide || !selectedAnnotationId) {
      return;
    }
    onSlideChange(currentIndex, deleteSlideAnnotation(slide, selectedAnnotationId));
    setSelectedAnnotationId(null);
  }

  function handleAnnotationColorChange(color: AnnotationColor) {
    setAnnotationColor(color);
    if (slide && selectedAnnotationId) {
      onSlideChange(
        currentIndex,
        recolorSlideAnnotation(slide, selectedAnnotationId, color),
      );
    }
  }

  async function toggleFullscreen() {
    const nextValue = !fullscreen;
    setFullscreen(nextValue);
    try {
      await getCurrentWindow().setFullscreen(nextValue);
    } catch {
      // Browser preview cannot control a Tauri window.
    }
  }

  async function exitPresenter() {
    if (fullscreen) {
      setFullscreen(false);
      try {
        await getCurrentWindow().setFullscreen(false);
      } catch {
        // Browser preview cannot control a Tauri window.
      }
    }
    onExit();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        previous();
      } else if (event.key === "Escape") {
        event.preventDefault();
        if (fullscreen) {
          void toggleFullscreen();
        } else {
          void exitPresenter();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div
      className={[
        "presenter-screen",
        fullscreen ? "presenter-screen--fullscreen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="presenter-screen"
    >
      <div
        className="presenter-stage"
        onClick={() => {
          if (annotationMode === "view") {
            next();
          }
        }}
      >
        <button
          aria-label="Previous slide"
          className="presenter-click-zone presenter-click-zone--left"
          onClick={(event) => {
            event.stopPropagation();
            previous();
          }}
          type="button"
        />
        <SlideViewport
          missing={slide?.missing}
          missingPath={slide?.filePath}
          overlay={
            slide ? (
              <AnnotationLayer
                annotations={slide.annotations}
                mode={fullscreen ? "view" : annotationMode}
                onChange={handleAnnotationChange}
                onSelect={setSelectedAnnotationId}
                selectedId={selectedAnnotationId}
                size={viewportSize}
                visible={annotationsVisible}
              />
            ) : null
          }
          ref={viewportRef}
          slideTitle={slide?.title ?? "No slide selected"}
          src={src}
        />
        <button
          aria-label="Next slide"
          className="presenter-click-zone presenter-click-zone--right"
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
          type="button"
        />
        <div className="slide-counter">
          {total === 0 ? 0 : currentIndex + 1} / {total}
        </div>
      </div>
      {!fullscreen && (
        <>
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
          <footer className="presenter-controls">
            <Button disabled={currentIndex === 0} onClick={previous} size="small">
              ←
            </Button>
            <Button
              disabled={currentIndex >= total - 1}
              onClick={next}
              size="small"
            >
              →
            </Button>
            <div className="dot-nav">
              {project.slides.map((item, index) => (
                <button
                  aria-label={`Go to slide ${index + 1}`}
                  className={index === currentIndex ? "dot dot--active" : "dot"}
                  key={item.id}
                  onClick={() => onIndexChange(selectSlideIndex(index, total))}
                  type="button"
                />
              ))}
            </div>
            <span className="presenter-title">{slide?.title ?? project.title}</span>
            <Button onClick={toggleFullscreen} size="small">
              Fullscreen
            </Button>
            <Button onClick={() => void exitPresenter()} size="small">
              Exit
            </Button>
          </footer>
        </>
      )}
    </div>
  );
}

export default PresenterScreen;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

function annotationId() {
  return globalThis.crypto?.randomUUID?.() ?? `annotation-${Date.now()}`;
}
