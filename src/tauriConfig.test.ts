import { describe, expect, it } from "vitest";

import tauriConfig from "../src-tauri/tauri.conf.json";

describe("Tauri local slide rendering configuration", () => {
  it("enables the asset protocol for convertFileSrc presenter URLs", () => {
    expect(tauriConfig.app.security.assetProtocol).toEqual({
      enable: true,
      scope: ["**/*"],
    });
  });
});
