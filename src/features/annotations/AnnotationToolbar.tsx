import Button from "../../components/Button";
import type { AnnotationKind } from "../../domain/annotations";
import type { AnnotationColor } from "../../domain/project";

export type AnnotationMode = "view" | "annotate";

type AnnotationToolbarProps = {
  color: AnnotationColor;
  mode: AnnotationMode;
  onAdd: (type: AnnotationKind) => void;
  onColorChange: (color: AnnotationColor) => void;
  onDeleteSelected: () => void;
  onModeChange: (mode: AnnotationMode) => void;
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
  const disabled = props.mode !== "annotate";

  return (
    <div className="annotation-toolbar">
      <Button
        onClick={() =>
          props.onModeChange(props.mode === "view" ? "annotate" : "view")
        }
        size="small"
        variant={props.mode === "annotate" ? "primary" : "default"}
      >
        Annotate
      </Button>
      <label className="annotation-toggle">
        <span>Show annotations</span>
        <input
          aria-label="Show annotations"
          checked={props.visible}
          onChange={(event) => props.onVisibilityChange(event.target.checked)}
          role="switch"
          type="checkbox"
        />
      </label>
      <Button disabled={disabled} onClick={() => props.onAdd("sticky-note")} size="small">
        Add sticky note
      </Button>
      <Button disabled={disabled} onClick={() => props.onAdd("text-box")} size="small">
        Add text box
      </Button>
      <Button disabled={disabled} onClick={() => props.onAdd("rectangle")} size="small">
        Add rectangle
      </Button>
      <Button disabled={disabled} onClick={() => props.onAdd("arrow")} size="small">
        Add arrow
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
            disabled={disabled}
            key={color}
            onClick={() => props.onColorChange(color)}
            style={{ backgroundColor: color }}
            type="button"
          />
        ))}
      </div>
      <Button
        disabled={disabled || !props.selectedId}
        onClick={props.onDeleteSelected}
        size="small"
      >
        Delete selected annotation
      </Button>
    </div>
  );
}

export default AnnotationToolbar;
