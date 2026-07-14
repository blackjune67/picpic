import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = resolve(ROOT, "scripts/youtube/sync.mjs");
const FIXTURE = resolve(ROOT, "fixtures/youtube/videos.json");

function runCli(args: readonly string[]) {
  const env = { ...process.env };
  delete env["YOUTUBE_API_KEY"];
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", SCRIPT, ...args],
    { cwd: ROOT, encoding: "utf8", env },
  );
}

describe("youtube:sync CLI", () => {
  it("runs dry-run from the fixture without an API key", () => {
    const result = runCli(["--dry-run", "--fixture", FIXTURE, "--now", "2026-07-14T00:00:00.000Z"]);

    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout) as {
      readonly mode: string;
      readonly refreshDueVideoIds: readonly string[];
      readonly chunks: readonly (readonly string[])[];
    };
    expect(output.mode).toBe("dry-run");
    expect(output.refreshDueVideoIds).toEqual(["PicPic00001", "PicPic00002"]);
    expect(output.chunks).toEqual([["PicPic00001", "PicPic00002"]]);
  });

  it("fails live mode clearly when the server-only key is absent", () => {
    const result = runCli(["--fixture", FIXTURE, "--now", "2026-07-14T00:00:00.000Z"]);

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toContain(
      "YOUTUBE_API_KEY is required for live YouTube sync",
    );
  });
});
