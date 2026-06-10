import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TitleBar from "./TitleBar";

const minimize = vi.fn();
const toggleMaximize = vi.fn();
const close = vi.fn();

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    close,
    minimize,
    toggleMaximize,
  }),
}));

describe("TitleBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes draggable window chrome and working window controls", () => {
    render(<TitleBar title="Lysbilde" />);

    expect(screen.getByRole("banner")).toHaveAttribute(
      "data-tauri-drag-region",
      "true",
    );
    expect(screen.getByText("Lysbilde")).toHaveAttribute(
      "data-tauri-drag-region",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Minimize window" }));
    fireEvent.click(screen.getByRole("button", { name: "Maximize window" }));
    fireEvent.click(screen.getByRole("button", { name: "Close window" }));

    expect(minimize).toHaveBeenCalledOnce();
    expect(toggleMaximize).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });
});
