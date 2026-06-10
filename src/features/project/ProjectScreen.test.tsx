import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Project } from "../../domain/project";
import ProjectScreen from "./ProjectScreen";

vi.mock("@tauri-apps/api/core", () => ({
  convertFileSrc: (path: string) => `asset://${path}`,
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

afterEach(() => cleanup());

describe("ProjectScreen", () => {
  it("does not expose annotation controls in project setup mode", () => {
    render(
      <ProjectScreen
        onBack={vi.fn()}
        onImport={vi.fn()}
        onPresent={vi.fn()}
        onProjectChange={vi.fn()}
        onSelectSlide={vi.fn()}
        project={project}
        selectedIndex={0}
      />,
    );

    expect(screen.getByRole("heading", { name: "Quarterly Review" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Present" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Annotate" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add sticky note" }),
    ).not.toBeInTheDocument();
  });
});
