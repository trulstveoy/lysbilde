import type { ReactNode } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SlideAnnotation } from "../../domain/project";
import AnnotationLayer from "./AnnotationLayer";

const transformNode = vi.hoisted(() => ({
  getChildren: vi.fn(() => transformChildren),
  height: vi.fn((value?: number) => value ?? 75),
  scale: vi.fn(),
  scaleX: vi.fn(() => 1.5),
  scaleY: vi.fn(() => 1.2),
  width: vi.fn((value?: number) => value ?? 200),
  x: vi.fn(() => 100),
  y: vi.fn(() => 50),
}));
const transformChildren = vi.hoisted(() => [
  {
    height: vi.fn(),
    width: vi.fn(),
  },
  {
    height: vi.fn(),
    width: vi.fn(),
  },
]);
const arrowNode = vi.hoisted(() => ({
  points: vi.fn(),
}));

vi.mock("react-konva", () => {
  const Node = ({
    children,
    "data-testid": testId,
    onClick,
    onDblClick,
    onDragEnd,
    onDragMove,
    onTransform,
    onTransformEnd,
    ref,
    text,
  }: {
    children?: ReactNode;
    "data-testid"?: string;
    onClick?: () => void;
    onDblClick?: () => void;
    onDragEnd?: (event: unknown) => void;
    onDragMove?: (event: unknown) => void;
    onTransform?: (event: unknown) => void;
    onTransformEnd?: (event: unknown) => void;
    ref?: (node: unknown) => void;
    text?: string;
  }) => {
    if (testId === "annotation-arrow-1-line") {
      ref?.(arrowNode);
    }

    return (
      <div
        data-testid={testId}
        onClick={onClick}
        onDoubleClick={onDblClick}
        onDrag={(event) => {
          const konvaEvent = {
            cancelBubble: false,
            target: {
              position: vi.fn(),
              x: () => 400,
              y: () => 300,
            },
          };
          onDragMove?.(konvaEvent);
          if (konvaEvent.cancelBubble) {
            event.stopPropagation();
          }
        }}
        onDragEnd={(event) => {
          const konvaEvent = {
            cancelBubble: false,
            target: {
              position: vi.fn(),
              x: () => 400,
              y: () => 300,
            },
          };
          onDragEnd?.(konvaEvent);
          if (konvaEvent.cancelBubble) {
            event.stopPropagation();
          }
        }}
        onMouseEnter={() =>
          onTransform?.({
            target: transformNode,
          })
        }
        onMouseLeave={() =>
          onTransformEnd?.({
            target: transformNode,
          })
        }
      >
        {text}
        {children}
      </div>
    );
  };

  return {
    Arrow: Node,
    Circle: Node,
    Group: Node,
    Layer: Node,
    Rect: Node,
    Stage: Node,
    Text: Node,
    Transformer: Node,
  };
});

afterEach(() => {
  cleanup();
  transformNode.getChildren.mockClear();
  transformNode.height.mockClear();
  transformNode.scale.mockClear();
  transformNode.scaleX.mockClear();
  transformNode.scaleY.mockClear();
  transformNode.width.mockClear();
  transformNode.x.mockClear();
  transformNode.y.mockClear();
  transformChildren.forEach((child) => {
    child.height.mockClear();
    child.width.mockClear();
  });
  arrowNode.points.mockClear();
  vi.restoreAllMocks();
});

describe("AnnotationLayer", () => {
  it("renders saved annotations when visible", () => {
    const annotations: SlideAnnotation[] = [
      {
        id: "note-1",
        type: "sticky-note",
        x: 0.1,
        y: 0.1,
        width: 0.2,
        height: 0.15,
        text: "Update this",
        color: "#fff59d",
      },
    ];

    render(
      <AnnotationLayer
        annotations={annotations}
        mode="view"
        onChange={vi.fn()}
        onSelect={vi.fn()}
        selectedId={null}
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    expect(screen.getByText("Update this")).toBeInTheDocument();
  });

  it("hides annotations without deleting them", () => {
    render(
      <AnnotationLayer
        annotations={[]}
        mode="view"
        onChange={vi.fn()}
        onSelect={vi.fn()}
        selectedId={null}
        size={{ width: 1000, height: 500 }}
        visible={false}
      />,
    );

    expect(screen.queryByTestId("annotation-stage")).not.toBeInTheDocument();
  });

  it("edits sticky note text inline instead of using a prompt", () => {
    const onChange = vi.fn();
    const promptSpy = vi.spyOn(window, "prompt");
    const annotations: SlideAnnotation[] = [
      {
        id: "note-1",
        type: "sticky-note",
        x: 0.1,
        y: 0.1,
        width: 0.2,
        height: 0.15,
        text: "Update this",
        color: "#fff59d",
      },
    ];

    render(
      <AnnotationLayer
        annotations={annotations}
        mode="annotate"
        onChange={onChange}
        onSelect={vi.fn()}
        selectedId="note-1"
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    fireEvent.doubleClick(screen.getByText("Update this"));
    const editor = screen.getByLabelText("Edit annotation text");
    fireEvent.change(editor, { target: { value: "Updated inline" } });
    fireEvent.blur(editor);

    expect(promptSpy).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({
      ...annotations[0],
      text: "Updated inline",
    });
  });

  it("hides the canvas text while inline editing", () => {
    const annotations: SlideAnnotation[] = [
      {
        id: "text-1",
        type: "text-box",
        x: 0.1,
        y: 0.1,
        width: 0.2,
        height: 0.15,
        text: "Only once",
        color: "#1976d2",
      },
    ];

    render(
      <AnnotationLayer
        annotations={annotations}
        mode="annotate"
        onChange={vi.fn()}
        onSelect={vi.fn()}
        selectedId="text-1"
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    fireEvent.doubleClick(screen.getByText("Only once"));

    expect(screen.getByLabelText("Edit annotation text")).toHaveValue("Only once");
    expect(
      within(screen.getByTestId("annotation-stage")).queryByText("Only once"),
    ).not.toBeInTheDocument();
  });

  it("keeps text size fixed while resizing text annotations without saving on every transform", () => {
    const onChange = vi.fn();
    const annotations: SlideAnnotation[] = [
      {
        id: "text-1",
        type: "text-box",
        x: 0.1,
        y: 0.1,
        width: 0.2,
        height: 0.15,
        text: "Resize me",
        color: "#1976d2",
      },
    ];

    render(
      <AnnotationLayer
        annotations={annotations}
        mode="annotate"
        onChange={onChange}
        onSelect={vi.fn()}
        selectedId="text-1"
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    fireEvent.mouseEnter(screen.getByTestId("annotation-text-1"));

    expect(transformNode.width).toHaveBeenCalledWith(300);
    expect(transformNode.height).toHaveBeenCalledWith(90);
    expect(transformNode.scale).toHaveBeenCalledWith({ x: 1, y: 1 });
    expect(transformChildren[0].width).toHaveBeenCalledWith(300);
    expect(transformChildren[0].height).toHaveBeenCalledWith(90);
    expect(transformChildren[1].width).toHaveBeenCalledWith(300);
    expect(transformChildren[1].height).toHaveBeenCalledWith(90);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.mouseLeave(screen.getByTestId("annotation-text-1"));

    expect(onChange).toHaveBeenCalledWith({
      ...annotations[0],
      x: 0.1,
      y: 0.1,
      width: 0.3,
      height: 0.18,
    });
  });

  it("shows draggable arrow endpoint handles when an arrow is selected", () => {
    const annotations: SlideAnnotation[] = [
      {
        id: "arrow-1",
        type: "arrow",
        x: 0.1,
        y: 0.2,
        endX: 0.4,
        endY: 0.5,
        strokeWidth: 4,
        color: "#d32f2f",
      },
    ];

    render(
      <AnnotationLayer
        annotations={annotations}
        mode="annotate"
        onChange={vi.fn()}
        onSelect={vi.fn()}
        selectedId="arrow-1"
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    expect(screen.getByTestId("annotation-arrow-1-start")).toBeInTheDocument();
    expect(screen.getByTestId("annotation-arrow-1-end")).toBeInTheDocument();
  });

  it("updates arrow endpoints and angle by dragging handles", () => {
    const onChange = vi.fn();
    const annotation: SlideAnnotation = {
      id: "arrow-1",
      type: "arrow",
      x: 0.1,
      y: 0.2,
      endX: 0.4,
      endY: 0.5,
      strokeWidth: 4,
      color: "#d32f2f",
    };

    render(
      <AnnotationLayer
        annotations={[annotation]}
        mode="annotate"
        onChange={onChange}
        onSelect={vi.fn()}
        selectedId="arrow-1"
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    fireEvent.dragEnd(screen.getByTestId("annotation-arrow-1-end"));
    fireEvent.dragEnd(screen.getByTestId("annotation-arrow-1-start"));

    expect(onChange).toHaveBeenNthCalledWith(1, {
      ...annotation,
      endX: 0.4,
      endY: 0.6,
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      ...annotation,
      x: 0.4,
      y: 0.6,
    });
  });

  it("renders arrow endpoint drag live without saving until release", () => {
    const onChange = vi.fn();
    const annotation: SlideAnnotation = {
      id: "arrow-1",
      type: "arrow",
      x: 0.1,
      y: 0.2,
      endX: 0.4,
      endY: 0.5,
      strokeWidth: 4,
      color: "#d32f2f",
    };

    render(
      <AnnotationLayer
        annotations={[annotation]}
        mode="annotate"
        onChange={onChange}
        onSelect={vi.fn()}
        selectedId="arrow-1"
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    fireEvent.drag(screen.getByTestId("annotation-arrow-1-end"));

    expect(arrowNode.points).toHaveBeenCalledWith([100, 100, 400, 300]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves the whole arrow by dragging the arrow body", () => {
    const onChange = vi.fn();
    const annotation: SlideAnnotation = {
      id: "arrow-1",
      type: "arrow",
      x: 0.1,
      y: 0.2,
      endX: 0.4,
      endY: 0.5,
      strokeWidth: 4,
      color: "#d32f2f",
    };

    render(
      <AnnotationLayer
        annotations={[annotation]}
        mode="annotate"
        onChange={onChange}
        onSelect={vi.fn()}
        selectedId="arrow-1"
        size={{ width: 1000, height: 500 }}
        visible={true}
      />,
    );

    fireEvent.dragEnd(screen.getByTestId("annotation-arrow-1"));

    expect(onChange).toHaveBeenCalledWith({
      ...annotation,
      x: 0.5,
      y: 0.8,
      endX: 0.8,
      endY: 1,
    });
  });
});
