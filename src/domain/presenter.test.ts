import { describe, expect, it } from "vitest";

import {
  nextSlideIndex,
  previousSlideIndex,
  selectSlideIndex,
} from "./presenter";

describe("presenter navigation", () => {
  it("moves to the next slide until the final slide", () => {
    expect(nextSlideIndex(0, 3)).toBe(1);
    expect(nextSlideIndex(1, 3)).toBe(2);
    expect(nextSlideIndex(2, 3)).toBe(2);
  });

  it("moves to the previous slide until the first slide", () => {
    expect(previousSlideIndex(2, 3)).toBe(1);
    expect(previousSlideIndex(1, 3)).toBe(0);
    expect(previousSlideIndex(0, 3)).toBe(0);
  });

  it("clamps direct selection into the available slide range", () => {
    expect(selectSlideIndex(1, 3)).toBe(1);
    expect(selectSlideIndex(-4, 3)).toBe(0);
    expect(selectSlideIndex(9, 3)).toBe(2);
  });

  it("returns zero for empty slide decks", () => {
    expect(nextSlideIndex(0, 0)).toBe(0);
    expect(previousSlideIndex(0, 0)).toBe(0);
    expect(selectSlideIndex(5, 0)).toBe(0);
  });
});
