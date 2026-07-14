import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

describe("PicPic design foundation", () => {
  it("defines the paper, ink, accent, and control tokens from DESIGN.md", () => {
    expect(stylesheet).toContain("--surface-paper");
    expect(stylesheet).toContain("--ink-primary");
    expect(stylesheet).toContain("--accent-red");
    expect(stylesheet).toContain("--control-height: 48px");
    expect(stylesheet).toContain("--shell-max-width: 560px");
  });

  it("keeps motion optional for reduced-motion users", () => {
    expect(stylesheet).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(stylesheet).toContain("animation-duration: 0.01ms");
  });
});
