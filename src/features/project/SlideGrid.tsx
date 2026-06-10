import type { KeyboardEvent } from "react";

import SlideThumbnail from "../../components/SlideThumbnail";
import type { Slide } from "../../domain/project";
import { usePointerReorder } from "./usePointerReorder";

type SlideGridProps = {
  onAddSlides: () => void;
  onReorder: (from: number, to: number) => void;
  onSelect: (index: number) => void;
  selectedIndex: number;
  slides: Slide[];
};

function SlideGrid({
  onAddSlides,
  onReorder,
  onSelect,
  selectedIndex,
  slides,
}: SlideGridProps) {
  const reorder = usePointerReorder({
    itemCount: slides.length,
    onReorder,
  });

  function handleSelectKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onSelect(index);
  }

  return (
    <div className="slide-grid">
      {slides.map((slide, index) => {
        const dragging = reorder.draggingIndex === index;
        const over =
          reorder.overIndex === index && reorder.draggingIndex !== null;

        return (
          <div
            className={[
              "slide-grid-item",
              dragging ? "slide-grid-item--dragging" : "",
              over ? "slide-grid-item--drop-target" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={slide.id}
            onPointerEnter={() => reorder.handlePointerEnter(index)}
          >
            <button
              aria-label={`Drag slide ${index + 1}`}
              className="slide-grid-drag-handle"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) =>
                reorder.handleKeyDown(event, index, "linear")
              }
              onPointerCancel={reorder.handlePointerCancel}
              onPointerDown={(event) => reorder.handlePointerDown(event, index)}
              onPointerUp={reorder.handlePointerUp}
              type="button"
            >
              ⠿
            </button>
            <SlideThumbnail
              index={index}
              selected={selectedIndex === index}
              slide={slide}
            />
            <div
              className="slide-grid-select"
              onClick={() => onSelect(index)}
              onKeyDown={(event) => handleSelectKeyDown(event, index)}
              role="button"
              tabIndex={0}
            >
              <span>{slide.title}</span>
              {slide.missing && <em>Missing file</em>}
            </div>
          </div>
        );
      })}
      <button className="slide-grid-add" onClick={onAddSlides} type="button">
        +
      </button>
    </div>
  );
}

export default SlideGrid;
