import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App shell", () => {
  it("renders the branded Lysbilde shell instead of the scaffold screen", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Lysbilde" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Presentations")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New presentation" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Hello World")).not.toBeInTheDocument();
  });
});
