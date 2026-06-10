import SlideThumbnail from "../../components/SlideThumbnail";
import type { Slide } from "../../domain/project";

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
  return (
    <div className="slide-list">
      <p className="slide-count">{slides.length} slides</p>
      {slides.map((slide, index) => (
        <button
          className={[
            "slide-list-item",
            selectedIndex === index ? "slide-list-item--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
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
          <span className="drag-handle">⠿</span>
          <SlideThumbnail compact index={index} slide={slide} />
          <span>{slide.title}</span>
        </button>
      ))}
    </div>
  );
}

export default SlideList;
