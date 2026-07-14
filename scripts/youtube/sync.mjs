import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const fixturePath = valueAfter("--fixture");
const isDryRun = args.includes("--dry-run");

if (!fixturePath) {
  console.error("--fixture is required for local sync");
  process.exit(1);
}

const input = JSON.parse(await readFile(fixturePath, "utf8"));
const videos = input.videos;
const now = valueAfter("--now") ?? new Date().toISOString();
const refreshDueVideoIds = videos
  .filter((video) => Date.parse(video.metadata.fetchedAt) < Date.parse(now) - 30 * 24 * 60 * 60 * 1000)
  .map((video) => video.videoId)
  .sort();
const skippedVideoIds = videos
  .filter((video) => !refreshDueVideoIds.includes(video.videoId))
  .map((video) => video.videoId)
  .sort();

if (!isDryRun && !process.env["YOUTUBE_API_KEY"]) {
  console.error("YOUTUBE_API_KEY is required for live YouTube sync");
  process.exit(1);
}

console.log(JSON.stringify({
  mode: isDryRun ? "dry-run" : "live",
  now,
  refreshDueVideoIds,
  skippedVideoIds,
  chunks: [refreshDueVideoIds],
}, null, 2));
