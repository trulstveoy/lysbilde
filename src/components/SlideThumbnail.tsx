import type { CSSProperties } from "react";

import type { Slide } from "../domain/project";

type SlideThumbnailProps = {
  index: number;
  selected?: boolean;
  slide?: Slide;
  compact?: boolean;
};

const palettes = [
  ["#0f0f1e", "#6c63ff"],
  ["#0b1922", "#00b4d8"],
  ["#180f28", "#a855f7"],
  ["#0c1f0c", "#22c55e"],
  ["#1e1108", "#f97316"],
  ["#1a0b0b", "#ef4444"],
  ["#0a1525", "#3b82f6"],
  ["#1a1800", "#eab308"],
];

function SlideThumbnail({
  compact = false,
  index,
  selected = false,
  slide,
}: SlideThumbnailProps) {
  const [background, accent] = palettes[index % palettes.length];
  const thumbnailStyle = {
    "--thumb-bg": background,
    "--thumb-accent": accent,
  } as CSSProperties;

  if (slide?.thumbnailPath) {
    return (
      <div
        className={[
          "slide-thumbnail",
          compact ? "slide-thumbnail--compact" : "",
          selected ? "slide-thumbnail--selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <img alt="" src={slide.thumbnailPath} />
      </div>
    );
  }

  return (
    <div
      className={[
        "slide-thumbnail",
        compact ? "slide-thumbnail--compact" : "",
        selected ? "slide-thumbnail--selected" : "",
        slide?.missing ? "slide-thumbnail--missing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={thumbnailStyle}
    >
      <span className="slide-thumbnail-line slide-thumbnail-line--title" />
      <span className="slide-thumbnail-line" />
      <span className="slide-thumbnail-line slide-thumbnail-line--short" />
      <span className="slide-thumbnail-number">{index + 1}</span>
    </div>
  );
}

export default SlideThumbnail;
