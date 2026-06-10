import { describe, expect, it } from "vitest";

import { createAnnotation, updateSlideAnnotation } from "./annotations";
import type { Project, StickyNoteAnnotation } from "./project";

function updateProjectSlide(
  project: Project,
  slideIndex: number,
  updater: (slide: Project["slides"][number]) => Project["slides"][number],
): Project {
  return {
    ...project,
    slides: project.slides.map((slide, index) =>
      index === slideIndex ? updater(slide) : slide,
    ),
  };
}

describe("project annotations", () => {
  it("stores annotations on the selected slide only", () => {
    const project: Project = {
      id: "project-1",
      title: "Deck",
      createdAt: "1",
      updatedAt: "1",
      displaySettings: { mode: "embedded" },
      annotations: [],
      slides: [
        {
          id: "slide-1",
          title: "Slide 1",
          filePath: "/tmp/1.html",
          thumbnailPath: null,
          annotations: [],
        },
        {
          id: "slide-2",
          title: "Slide 2",
          filePath: "/tmp/2.html",
          thumbnailPath: null,
          annotations: [],
        },
      ],
    };

    const annotation: StickyNoteAnnotation = createAnnotation("sticky-note", {
      id: "a1",
      x: 0.15,
      y: 0.25,
      color: "#fff59d",
    });

    const updated = updateProjectSlide(project, 1, (slide) =>
      updateSlideAnnotation(
        { ...slide, annotations: [annotation] },
        { ...annotation, text: "Persist me" },
      ),
    );

    expect(updated.slides[0].annotations).toEqual([]);
    expect(updated.slides[1].annotations).toHaveLength(1);
    expect(updated.slides[1].annotations[0]).toMatchObject({
      id: "a1",
      text: "Persist me",
    });
  });
});
