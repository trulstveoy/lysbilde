import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const appCss = readFileSync(join(process.cwd(), "src/App.css"), "utf8");

describe("presenter layout CSS", () => {
  it("uses a definite viewport height so the slide iframe fills presentation mode", () => {
    expect(appCss).toContain(".presenter-screen {\n  width: 100%;\n  height: 100vh;");
    expect(appCss).toContain(".presenter-stage {\n  position: relative;\n  flex: 1 1 auto;");
    expect(appCss).toContain(".slide-frame {\n  position: absolute;\n  inset: 0;");
  });
});
