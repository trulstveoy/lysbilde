import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AnnotationToolbar from "./AnnotationToolbar";

afterEach(() => cleanup());

describe("AnnotationToolbar", () => {
  it("toggles annotation mode and visibility", () => {
    const onModeChange = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <AnnotationToolbar
        color="#fff59d"
        mode="view"
        onAdd={vi.fn()}
        onColorChange={vi.fn()}
        onDeleteSelected={vi.fn()}
        onModeChange={onModeChange}
        onVisibilityChange={onVisibilityChange}
        selectedId={null}
        visible={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Annotate" }));
    fireEvent.click(screen.getByRole("switch", { name: "Show annotations" }));

    expect(onModeChange).toHaveBeenCalledWith("annotate");
    expect(onVisibilityChange).toHaveBeenCalledWith(false);
  });

  it("adds annotation objects and deletes the selected object", () => {
    const onAdd = vi.fn();
    const onDeleteSelected = vi.fn();

    render(
      <AnnotationToolbar
        color="#fff59d"
        mode="annotate"
        onAdd={onAdd}
        onColorChange={vi.fn()}
        onDeleteSelected={onDeleteSelected}
        onModeChange={vi.fn()}
        onVisibilityChange={vi.fn()}
        selectedId="a1"
        visible={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add sticky note" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected annotation" }));

    expect(onAdd).toHaveBeenCalledWith("sticky-note");
    expect(onDeleteSelected).toHaveBeenCalledOnce();
  });
});
