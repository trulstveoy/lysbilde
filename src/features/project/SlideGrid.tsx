import SlideThumbnail from "../../components/SlideThumbnail";
import type { Slide } from "../../domain/project";

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
  return (
    <div className="slide-grid">
      {slides.map((slide, index) => (
        <button
          className="slide-grid-item"
          draggable
          key={slide.id}
          onClick={() => onSelect(index)}
          onDragOver={(event) => event.preventDefault()}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", index.toString());
          }}
          onDrop={(event) => {
            event.preventDefault();
            const from = Number(event.dataTransfer.getData("text/plain"));
            if (!Number.isNaN(from)) {
              onReorder(from, index);
            }
          }}
          type="button"
        >
          <SlideThumbnail
            index={index}
            selected={selectedIndex === index}
            slide={slide}
          />
          <span>{slide.title}</span>
          {slide.missing && <em>Missing file</em>}
        </button>
      ))}
      <button className="slide-grid-add" onClick={onAddSlides} type="button">
        +
      </button>
    </div>
  );
}

export default SlideGrid;
