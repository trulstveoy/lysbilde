import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ResizeHandles from "./ResizeHandles";

const startResizeDragging = vi.fn();

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    startResizeDragging,
  }),
}));

describe("ResizeHandles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts Tauri resize dragging from the larger edge handles", () => {
    render(<ResizeHandles />);

    fireEvent.pointerDown(screen.getByLabelText("Resize window from right"));
    fireEvent.pointerDown(
      screen.getByLabelText("Resize window from bottom right"),
    );

    expect(startResizeDragging).toHaveBeenNthCalledWith(1, "East");
    expect(startResizeDragging).toHaveBeenNthCalledWith(2, "SouthEast");
  });
});
