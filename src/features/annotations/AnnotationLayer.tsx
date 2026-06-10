import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import {
  Arrow,
  Circle,
  Group,
  Layer,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";

import type { SlideAnnotation } from "../../domain/project";
import type { AnnotationMode } from "./AnnotationToolbar";

type AnnotationLayerProps = {
  annotations: SlideAnnotation[];
  mode: AnnotationMode;
  onChange: (annotation: SlideAnnotation) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  size: { width: number; height: number };
  visible: boolean;
};

function px(value: number, total: number) {
  return value * total;
}

function rel(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, Number((value / total).toFixed(4))));
}

function resizeNode(node: Konva.Node) {
  const nextWidth = Math.max(24, node.width() * node.scaleX());
  const nextHeight = Math.max(24, node.height() * node.scaleY());
  node.width(nextWidth);
  node.height(nextHeight);
  if (hasChildren(node)) {
    node.getChildren().forEach((child) => {
      child.width(nextWidth);
      child.height(nextHeight);
    });
  }
  node.scale({ x: 1, y: 1 });
  return { nextWidth, nextHeight };
}

function hasChildren(node: Konva.Node): node is Konva.Group {
  return typeof (node as Konva.Group).getChildren === "function";
}

function resizeAnnotationFromNode<
  T extends Exclude<SlideAnnotation, { type: "arrow" }>,
>(
  annotation: T,
  node: Konva.Node,
  size: { width: number; height: number },
): T {
  const { nextWidth, nextHeight } = resizeNode(node);

  return {
    ...annotation,
    x: rel(node.x(), size.width),
    y: rel(node.y(), size.height),
    width: rel(nextWidth, size.width),
    height: rel(nextHeight, size.height),
  };
}

type EditableTextAnnotation = Extract<
  SlideAnnotation,
  { type: "sticky-note" | "text-box" }
>;

function AnnotationLayer({
  annotations,
  mode,
  onChange,
  onSelect,
  selectedId,
  size,
  visible,
}: AnnotationLayerProps) {
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({});
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  const selectedAnnotation = annotations.find(
    (annotation) => annotation.id === selectedId,
  );
  const editable = mode === "annotate";
  const editingAnnotation = annotations.find(
    (annotation): annotation is EditableTextAnnotation =>
      annotation.id === editingId &&
      (annotation.type === "sticky-note" || annotation.type === "text-box"),
  );

  useEffect(() => {
    if (mode !== "annotate") {
      setEditingId(null);
    }
  }, [mode]);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, [editingId]);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer || !selectedAnnotation || selectedAnnotation.type === "arrow") {
      transformer?.nodes([]);
      return;
    }

    const node = nodeRefs.current[selectedAnnotation.id];
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedAnnotation]);

  if (!visible || size.width <= 0 || size.height <= 0) {
    return null;
  }

  function startTextEdit(annotation: EditableTextAnnotation) {
    if (!editable) {
      return;
    }
    onSelect(annotation.id);
    setEditingId(annotation.id);
    setDraftText(annotation.text);
  }

  function commitTextEdit() {
    if (!editingAnnotation) {
      setEditingId(null);
      return;
    }

    if (draftText !== editingAnnotation.text) {
      onChange({ ...editingAnnotation, text: draftText });
    }
    setEditingId(null);
  }

  function cancelTextEdit() {
    setEditingId(null);
    setDraftText("");
  }

  return (
    <div className="annotation-layer">
      <Stage
        className={[
          "annotation-stage",
          editable ? "annotation-stage--editable" : "annotation-stage--view",
        ]
          .filter(Boolean)
          .join(" ")}
        data-testid="annotation-stage"
        height={size.height}
        onMouseDown={(event) => {
          if (event.target === event.target.getStage()) {
            onSelect(null);
          }
        }}
        width={size.width}
      >
        <Layer>
          {annotations.map((annotation) => {
          if (annotation.type === "arrow") {
            const startX = px(annotation.x, size.width);
            const startY = px(annotation.y, size.height);
            const endX = px(annotation.endX, size.width);
            const endY = px(annotation.endY, size.height);

            return (
              <Group
                draggable={editable}
                key={annotation.id}
                onClick={() => onSelect(annotation.id)}
                onDragEnd={(event) => {
                  const dx = rel(event.target.x(), size.width);
                  const dy = rel(event.target.y(), size.height);
                  event.target.position({ x: 0, y: 0 });
                  onChange({
                    ...annotation,
                    x: Math.max(0, Math.min(1, annotation.x + dx)),
                    y: Math.max(0, Math.min(1, annotation.y + dy)),
                    endX: Math.max(0, Math.min(1, annotation.endX + dx)),
                    endY: Math.max(0, Math.min(1, annotation.endY + dy)),
                  });
                }}
              >
                <Arrow
                  fill={annotation.color}
                  points={[startX, startY, endX, endY]}
                  pointerLength={12}
                  pointerWidth={12}
                  stroke={annotation.color}
                  strokeWidth={annotation.strokeWidth}
                />
                {editable && selectedId === annotation.id && (
                  <>
                    <Circle
                      draggable
                      fill="#ffffff"
                      onDragEnd={(event) =>
                        onChange({
                          ...annotation,
                          x: rel(event.target.x(), size.width),
                          y: rel(event.target.y(), size.height),
                        })
                      }
                      radius={7}
                      stroke={annotation.color}
                      strokeWidth={2}
                      x={startX}
                      y={startY}
                    />
                    <Circle
                      draggable
                      fill="#ffffff"
                      onDragEnd={(event) =>
                        onChange({
                          ...annotation,
                          endX: rel(event.target.x(), size.width),
                          endY: rel(event.target.y(), size.height),
                        })
                      }
                      radius={7}
                      stroke={annotation.color}
                      strokeWidth={2}
                      x={endX}
                      y={endY}
                    />
                  </>
                )}
              </Group>
            );
          }

          const x = px(annotation.x, size.width);
          const y = px(annotation.y, size.height);
          const width = px(annotation.width, size.width);
          const height = px(annotation.height, size.height);
          const isEditingText = annotation.id === editingId;

          const common = {
            "data-testid": `annotation-${annotation.id}`,
            draggable: editable,
            onClick: () => onSelect(annotation.id),
            onDblClick: () => {
              if (annotation.type === "sticky-note" || annotation.type === "text-box") {
                startTextEdit(annotation);
              }
            },
            onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) =>
              onChange({
                ...annotation,
                x: rel(event.target.x(), size.width),
                y: rel(event.target.y(), size.height),
              }),
            onTransform: (event: Konva.KonvaEventObject<Event>) => {
              resizeNode(event.target);
            },
            onTransformEnd: (event: Konva.KonvaEventObject<Event>) => {
              onChange(resizeAnnotationFromNode(annotation, event.target, size));
            },
            ref: (node: Konva.Node | null) => {
              nodeRefs.current[annotation.id] = node;
            },
            x,
            y,
          };

          if (annotation.type === "rectangle") {
            return (
              <Rect
                {...common}
                fill={annotation.fillColor}
                height={height}
                key={annotation.id}
                stroke={annotation.color}
                strokeWidth={3}
                width={width}
              />
            );
          }

          return (
            <Group {...common} height={height} key={annotation.id} width={width}>
              {annotation.type === "sticky-note" && (
                <Rect
                  fill={annotation.color}
                  height={height}
                  shadowBlur={8}
                  width={width}
                />
              )}
              {!isEditingText && (
                <Text
                  fill={
                    annotation.type === "text-box" ? annotation.color : "#1f2933"
                  }
                  fontSize={18}
                  height={height}
                  padding={10}
                  text={annotation.text}
                  width={width}
                />
              )}
            </Group>
          );
          })}
          {editable && selectedAnnotation?.type !== "arrow" && !editingAnnotation && (
            <Transformer ref={transformerRef} rotateEnabled={false} />
          )}
        </Layer>
      </Stage>
      {editingAnnotation && (
        <textarea
          aria-label="Edit annotation text"
          className={[
            "annotation-text-editor",
            editingAnnotation.type === "sticky-note"
              ? "annotation-text-editor--sticky-note"
              : "annotation-text-editor--text-box",
          ].join(" ")}
          onBlur={commitTextEdit}
          onChange={(event) => setDraftText(event.target.value)}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              event.preventDefault();
              cancelTextEdit();
            }
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              commitTextEdit();
            }
          }}
          ref={textareaRef}
          style={{
            backgroundColor:
              editingAnnotation.type === "sticky-note"
                ? editingAnnotation.color
                : "rgba(0, 0, 0, 0.1)",
            color:
              editingAnnotation.type === "text-box"
                ? editingAnnotation.color
                : "#1f2933",
            height: px(editingAnnotation.height, size.height),
            left: px(editingAnnotation.x, size.width),
            top: px(editingAnnotation.y, size.height),
            width: px(editingAnnotation.width, size.width),
          }}
          value={draftText}
        />
      )}
    </div>
  );
}

export default AnnotationLayer;
