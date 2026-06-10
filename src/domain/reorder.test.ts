import { describe, expect, it } from "vitest";

import { moveItem, selectedIndexAfterMove } from "./reorder";

describe("moveItem", () => {
  const slides = ["a", "b", "c", "d"];

  it("moves an item down", () => {
    expect(moveItem(slides, 1, 3)).toEqual(["a", "c", "d", "b"]);
  });

  it("moves an item up", () => {
    expect(moveItem(slides, 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("returns the original list for same index and invalid indexes", () => {
    expect(moveItem(slides, 2, 2)).toBe(slides);
    expect(moveItem(slides, -1, 2)).toBe(slides);
    expect(moveItem(slides, 1, -1)).toBe(slides);
    expect(moveItem(slides, 99, 1)).toBe(slides);
    expect(moveItem(slides, 1, 99)).toBe(slides);
  });
});

describe("selectedIndexAfterMove", () => {
  it("keeps the moved item selected", () => {
    expect(selectedIndexAfterMove(1, 1, 3)).toBe(3);
    expect(selectedIndexAfterMove(3, 3, 0)).toBe(0);
  });

  it("shifts selection when an earlier item moves after it", () => {
    expect(selectedIndexAfterMove(2, 0, 3)).toBe(1);
  });

  it("shifts selection when a later item moves before it", () => {
    expect(selectedIndexAfterMove(1, 3, 0)).toBe(2);
  });

  it("preserves selection for same index and invalid moves", () => {
    expect(selectedIndexAfterMove(2, 2, 2, 4)).toBe(2);
    expect(selectedIndexAfterMove(2, -1, 3, 4)).toBe(2);
    expect(selectedIndexAfterMove(2, 1, 99, 4)).toBe(2);
  });
});
