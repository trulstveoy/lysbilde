import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SlideAnnotation } from "../../domain/project";
import AnnotationLayer from "./AnnotationLayer";

vi.mock("react-konva", () => {
  const Node = ({
    children,
    "data-testid": testId,
    text,
  }: {
    children?: ReactNode;
    "data-testid"?: string;
    text?: string;
  }) => (
    <div data-testid={testId}>
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

afterEach(() => cleanup());

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
});
