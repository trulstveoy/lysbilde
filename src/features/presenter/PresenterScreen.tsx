import { useEffect, useMemo, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

import Button from "../../components/Button";
import type { Project } from "../../domain/project";
import {
  nextSlideIndex,
  previousSlideIndex,
  selectSlideIndex,
} from "../../domain/presenter";

type PresenterScreenProps = {
  currentIndex: number;
  onExit: () => void;
  onIndexChange: (index: number) => void;
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
  project,
}: PresenterScreenProps) {
  const [fullscreen, setFullscreen] = useState(false);
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

  async function toggleFullscreen() {
    const nextValue = !fullscreen;
    setFullscreen(nextValue);
    try {
      await getCurrentWindow().setFullscreen(nextValue);
    } catch {
      // Browser preview cannot control a Tauri window.
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
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
          onExit();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="presenter-screen">
      <div className="presenter-stage" onClick={next}>
        <button
          aria-label="Previous slide"
          className="presenter-click-zone presenter-click-zone--left"
          onClick={(event) => {
            event.stopPropagation();
            previous();
          }}
          type="button"
        />
        {slide?.missing ? (
          <div className="missing-slide">
            <h2>Slide file missing</h2>
            <p>{slide.filePath}</p>
          </div>
        ) : src ? (
          <iframe className="slide-frame" src={src} title={slide.title} />
        ) : (
          <div className="missing-slide">
            <h2>No slide selected</h2>
          </div>
        )}
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
          {fullscreen ? "Window" : "Fullscreen"}
        </Button>
        <Button onClick={onExit} size="small">
          Exit
        </Button>
      </footer>
    </div>
  );
}

export default PresenterScreen;
