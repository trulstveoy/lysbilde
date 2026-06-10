import { describe, expect, it } from "vitest";

import {
  createAnnotation,
  deleteSlideAnnotation,
  denormalizeBox,
  normalizeBox,
  recolorSlideAnnotation,
  updateSlideAnnotation,
} from "./annotations";
import type { Slide } from "./project";

describe("annotations", () => {
  it("creates sticky notes with relative defaults", () => {
    const annotation = createAnnotation("sticky-note", {
      id: "annotation-1",
      x: 0.25,
      y: 0.5,
      color: "#fff59d",
    });

    expect(annotation).toEqual({
      id: "annotation-1",
      type: "sticky-note",
      x: 0.25,
      y: 0.5,
      width: 0.2,
      height: 0.15,
      text: "New note",
      color: "#fff59d",
    });
  });

  it("normalizes and denormalizes boxes against the slide viewport", () => {
    expect(
      normalizeBox(
        { x: 192, y: 108, width: 384, height: 216 },
        { width: 1920, height: 1080 },
      ),
    ).toEqual({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 });

    expect(
      denormalizeBox(
        { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
        { width: 1920, height: 1080 },
      ),
    ).toEqual({ x: 192, y: 108, width: 384, height: 216 });
  });

  it("updates one annotation without mutating the slide", () => {
    const slide: Slide = {
      id: "slide-1",
      title: "Slide 1",
      filePath: "/tmp/slide.html",
      thumbnailPath: null,
      annotations: [
        createAnnotation("text-box", {
          id: "a1",
          x: 0.1,
          y: 0.2,
          color: "#1976d2",
        }),
      ],
    };

    const updated = updateSlideAnnotation(slide, {
      ...slide.annotations[0],
      x: 0.3,
    });

    expect(updated).not.toBe(slide);
    expect(updated.annotations[0].x).toBe(0.3);
    expect(slide.annotations[0].x).toBe(0.1);
  });

  it("deletes annotations immutably", () => {
    const slide: Slide = {
      id: "slide-1",
      title: "Slide 1",
      filePath: "/tmp/slide.html",
      thumbnailPath: null,
      annotations: [
        createAnnotation("rectangle", {
          id: "a1",
          x: 0.1,
          y: 0.1,
          color: "#d32f2f",
        }),
      ],
    };

    expect(deleteSlideAnnotation(slide, "a1").annotations).toEqual([]);
    expect(slide.annotations).toHaveLength(1);
  });

  it("recolors the selected annotation", () => {
    const slide: Slide = {
      id: "slide-1",
      title: "Slide 1",
      filePath: "/tmp/slide.html",
      thumbnailPath: null,
      annotations: [
        createAnnotation("text-box", {
          id: "a1",
          x: 0.1,
          y: 0.1,
          color: "#1976d2",
        }),
      ],
    };

    const updated = recolorSlideAnnotation(slide, "a1", "#f57c00");

    expect(updated.annotations[0].color).toBe("#f57c00");
  });
});
