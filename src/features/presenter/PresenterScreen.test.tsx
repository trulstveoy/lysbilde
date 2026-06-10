import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Project } from "../../domain/project";
import PresenterScreen from "./PresenterScreen";

const setFullscreen = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
  convertFileSrc: (path: string) => `asset://${path}`,
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    setFullscreen,
  }),
}));

const project: Project = {
  id: "project-1",
  title: "Quarterly Review",
  createdAt: "1",
  updatedAt: "1",
  displaySettings: { mode: "embedded" },
  annotations: [],
  slides: [
    {
      id: "slide-1",
      title: "Opening",
      filePath: "/slides/opening.html",
      thumbnailPath: null,
      annotations: [],
    },
  ],
};

describe("PresenterScreen fullscreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a presentation-only layout while fullscreen is active", () => {
    render(
      <PresenterScreen
        currentIndex={0}
        onExit={vi.fn()}
        onIndexChange={vi.fn()}
        onSlideChange={vi.fn()}
        project={project}
      />,
    );

    expect(screen.getByRole("button", { name: "Annotate" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fullscreen" }));

    expect(setFullscreen).toHaveBeenCalledWith(true);
    expect(screen.getByTestId("presenter-screen")).toHaveClass(
      "presenter-screen--fullscreen",
    );
    expect(
      screen.queryByRole("button", { name: "Fullscreen" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Annotate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Exit" })).not.toBeInTheDocument();
    expect(screen.getByTitle("Opening")).toHaveClass("slide-frame");
  });

  it("exits fullscreen with Escape before leaving presentation mode", () => {
    const onExit = vi.fn();

    render(
      <PresenterScreen
        currentIndex={0}
        onExit={onExit}
        onIndexChange={vi.fn()}
        onSlideChange={vi.fn()}
        project={project}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Fullscreen" }));
    fireEvent.keyDown(window, { key: "Escape" });

    expect(setFullscreen).toHaveBeenNthCalledWith(1, true);
    expect(setFullscreen).toHaveBeenNthCalledWith(2, false);
    expect(onExit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Fullscreen" })).toBeInTheDocument();
  });

  it("does not advance slides when space is typed inside a text field", () => {
    const onIndexChange = vi.fn();

    render(
      <PresenterScreen
        currentIndex={0}
        onExit={vi.fn()}
        onIndexChange={onIndexChange}
        onSlideChange={vi.fn()}
        project={project}
      />,
    );

    const editor = document.createElement("textarea");
    document.body.appendChild(editor);
    fireEvent.keyDown(editor, { key: " " });

    expect(onIndexChange).not.toHaveBeenCalled();
  });
});
