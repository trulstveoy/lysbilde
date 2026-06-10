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

vi.mock("react-konva", () => {
  const Node = ({
    children,
    "data-testid": testId,
    onClick,
    onDblClick,
    text,
  }: {
    children?: ReactNode;
    "data-testid"?: string;
    onClick?: () => void;
    onDblClick?: () => void;
    text?: string;
  }) => (
    <div data-testid={testId} onClick={onClick} onDoubleClick={onDblClick}>
      {text}
      {children}
    </div>
  );

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
});
