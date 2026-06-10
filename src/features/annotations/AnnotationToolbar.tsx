import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Square,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";

import Button from "../../components/Button";
import type { AnnotationKind } from "../../domain/annotations";
import type { AnnotationColor } from "../../domain/project";

export type AnnotationMode = "view" | "annotate";

type AnnotationToolbarProps = {
  color: AnnotationColor;
  onAdd: (type: AnnotationKind) => void;
  onColorChange: (color: AnnotationColor) => void;
  onDeleteSelected: () => void;
  onVisibilityChange: (visible: boolean) => void;
  selectedId: string | null;
  visible: boolean;
};

const colors: AnnotationColor[] = [
  "#fff59d",
  "#d32f2f",
  "#2e7d32",
  "#1976d2",
  "#f57c00",
];

function AnnotationToolbar(props: AnnotationToolbarProps) {
  return (
    <div className="annotation-toolbar">
      <Button
        aria-label="Show annotations"
        aria-pressed={props.visible}
        className="annotation-icon-button"
        onClick={() => props.onVisibilityChange(!props.visible)}
        size="small"
        title={props.visible ? "Hide annotations" : "Show annotations"}
      >
        {props.visible ? (
          <Eye aria-hidden="true" size={16} strokeWidth={2} />
        ) : (
          <EyeOff aria-hidden="true" size={16} strokeWidth={2} />
        )}
      </Button>
      <Button
        aria-label="Add sticky note"
        className="annotation-icon-button"
        onClick={() => props.onAdd("sticky-note")}
        size="small"
        title="Add sticky note"
      >
        <StickyNote aria-hidden="true" size={16} strokeWidth={2} />
      </Button>
      <Button
        aria-label="Add text box"
        className="annotation-icon-button"
        onClick={() => props.onAdd("text-box")}
        size="small"
        title="Add text box"
      >
        <Type aria-hidden="true" size={16} strokeWidth={2} />
      </Button>
      <Button
        aria-label="Add rectangle"
        className="annotation-icon-button"
        onClick={() => props.onAdd("rectangle")}
        size="small"
        title="Add rectangle"
      >
        <Square aria-hidden="true" size={16} strokeWidth={2} />
      </Button>
      <Button
        aria-label="Add arrow"
        className="annotation-icon-button"
        onClick={() => props.onAdd("arrow")}
        size="small"
        title="Add arrow"
      >
        <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2} />
      </Button>
      <div aria-label="Annotation colors" className="annotation-colors">
        {colors.map((color) => (
          <button
            aria-label={`Use color ${color}`}
            className={
              color === props.color
                ? "annotation-swatch annotation-swatch--active"
                : "annotation-swatch"
            }
            key={color}
            onClick={() => props.onColorChange(color)}
            style={{ backgroundColor: color }}
            type="button"
          />
        ))}
      </div>
      <Button
        aria-label="Delete selected annotation"
        className="annotation-icon-button"
        disabled={!props.selectedId}
        onClick={props.onDeleteSelected}
        size="small"
        title="Delete selected annotation"
      >
        <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
      </Button>
    </div>
  );
}

export default AnnotationToolbar;
