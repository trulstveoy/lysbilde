import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SlideThumbnail from "./SlideThumbnail";

vi.mock("@tauri-apps/api/core", () => ({
  convertFileSrc: (path: string) => `asset://localhost/${path}`,
}));

describe("SlideThumbnail", () => {
  it("renders the imported HTML file as the thumbnail preview", () => {
    render(
      <SlideThumbnail
        index={0}
        slide={{
          id: "slide-1",
          title: "Agenda",
          filePath: "/tmp/agenda.html",
          thumbnailPath: null,
          missing: false,
          annotations: [],
        }}
      />,
    );

    const preview = screen.getByTitle("Preview: Agenda");
    expect(preview).toHaveAttribute("src", "asset://localhost//tmp/agenda.html");
  });
});
