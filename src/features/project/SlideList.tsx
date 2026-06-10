import type { KeyboardEvent } from "react";

import SlideThumbnail from "../../components/SlideThumbnail";
import type { Slide } from "../../domain/project";
import { usePointerReorder } from "./usePointerReorder";

type SlideListProps = {
  onReorder: (from: number, to: number) => void;
  onSelect: (index: number) => void;
  selectedIndex: number;
  slides: Slide[];
};

function SlideList({
  onReorder,
  onSelect,
  selectedIndex,
  slides,
}: SlideListProps) {
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
    <div className="slide-list">
      <p className="slide-count">{slides.length} slides</p>
      {slides.map((slide, index) => {
        const dragging = reorder.draggingIndex === index;
        const over =
          reorder.overIndex === index && reorder.draggingIndex !== null;

        return (
          <div
            className={[
              "slide-list-item",
              selectedIndex === index ? "slide-list-item--active" : "",
              dragging ? "slide-list-item--dragging" : "",
              over ? "slide-list-item--drop-target" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={slide.id}
            onPointerEnter={() => reorder.handlePointerEnter(index)}
          >
            <button
              aria-label={`Drag slide ${index + 1}`}
              className="drag-handle"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) =>
                reorder.handleKeyDown(event, index, "vertical")
              }
              onPointerCancel={reorder.handlePointerCancel}
              onPointerDown={(event) => reorder.handlePointerDown(event, index)}
              onPointerUp={reorder.handlePointerUp}
              type="button"
            >
              ⠿
            </button>
            <div className="slide-list-thumbnail">
              <SlideThumbnail compact index={index} slide={slide} />
            </div>
            <div
              className="slide-list-select"
              onClick={() => onSelect(index)}
              onKeyDown={(event) => handleSelectKeyDown(event, index)}
              role="button"
              tabIndex={0}
            >
              <span>{slide.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SlideList;
