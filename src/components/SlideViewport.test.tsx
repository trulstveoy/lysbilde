import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SlideViewport from "./SlideViewport";

describe("SlideViewport", () => {
  it("renders the iframe and overlay in the same named viewport", () => {
    render(
      <SlideViewport
        overlay={<div data-testid="annotation-overlay" />}
        slideTitle="Slide 1"
        src="/slide.html"
      />,
    );

    expect(screen.getByTitle("Slide 1")).toHaveClass("slide-frame");
    expect(screen.getByTestId("annotation-overlay")).toBeInTheDocument();
    expect(screen.getByLabelText("Slide viewport")).toHaveClass("slide-viewport");
  });
});
