import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const appCss = readFileSync(join(process.cwd(), "src/App.css"), "utf8");

describe("presenter layout CSS", () => {
  it("uses a definite viewport height so the slide iframe fills presentation mode", () => {
    expect(appCss).toContain(".presenter-root {\n  width: 100%;\n  height: calc(100vh - 42px);");
    expect(appCss).toContain(".presenter-screen {\n  width: 100%;\n  height: 100%;");
    expect(appCss).toContain(".presenter-screen--fullscreen {\n  position: fixed;\n  inset: 0;");
    expect(appCss).toContain(".presenter-stage {\n  position: relative;\n  flex: 1 1 auto;");
    expect(appCss).toContain(".slide-frame {\n  position: absolute;\n  inset: 0;");
  });
});
