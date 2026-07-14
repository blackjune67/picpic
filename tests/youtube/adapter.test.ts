import { describe, expect, it } from "vitest";
import {
  createYouTubeApiKey,
  createYouTubeMetadataAdapter,
  planYouTubeMetadataRefresh,
  type Fetcher,
  type RequestLog,
  type YouTubeMetadataRecord,
} from "../../lib/youtube";

const NOW = new Date("2026-07-14T00:00:00.000Z");
const FRESH = new Date("2026-06-15T00:00:00.000Z").toISOString();
const STALE = new Date("2026-05-01T00:00:00.000Z").toISOString();

function video(videoId: string, fetchedAt: string | null, etag: string | null = null): YouTubeMetadataRecord {
  return {
    videoId,
    metadata: {
      title: "Editorial title",
      publishedAt: "2026-01-01T00:00:00.000Z",
      duration: "PT1M",
      privacyStatus: "public",
      uploadStatus: "processed",
      liveBroadcastContent: "none",
      availability: "available",
      etag,
      fetchedAt,
    },
  };
}

function response(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(status === 304 ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("YouTube metadata refresh adapter", () => {
  it("sorts IDs before making configurable 50-id chunks and narrows the videos.list wire fields", async () => {
    const requests: RequestLog[] = [];
    const fetcher: Fetcher = async (input, init) => {
      requests.push({ url: String(input), init });
      return response({ items: [] });
    };
    const adapter = createYouTubeMetadataAdapter({
      apiKey: createYouTubeApiKey("test-key"),
      fetcher,
      chunkSize: 2,
    });

    await adapter.refresh(
      [video("video-c", STALE), video("video-a", STALE), video("video-b", STALE)],
      { now: NOW },
    );

    expect(requests).toHaveLength(2);
    expect(requests.map(({ url }) => new URL(url).searchParams.get("id"))).toEqual([
      "video-a,video-b",
      "video-c",
    ]);
    const firstUrl = new URL(requests[0]?.url ?? "https://invalid.test");
    expect(firstUrl.searchParams.get("part")).toBe("snippet,contentDetails,status");
    expect(firstUrl.searchParams.get("key")).toBe("test-key");
    const fields = firstUrl.searchParams.get("fields") ?? "";
    expect(fields).toContain("items(id,etag,snippet(publishedAt,title,liveBroadcastContent)");
    expect(fields).toContain("contentDetails(duration)");
    expect(fields).toContain("status(uploadStatus,privacyStatus)");
    expect(fields).not.toContain("description");
    expect(fields).not.toContain("thumbnails");
    expect(fields).not.toContain("statistics");
  });

  it("updates only metadata fields from a 200 response", async () => {
    const fetcher: Fetcher = async () =>
      response({
        items: [
          {
            id: "video-a",
            etag: "etag-new",
            snippet: {
              title: "API title",
              publishedAt: "2026-06-01T00:00:00Z",
              liveBroadcastContent: "none",
              description: "must never be persisted",
              thumbnails: { high: { url: "https://example.test/thumb.jpg" } },
            },
            contentDetails: { duration: "PT12M" },
            status: { uploadStatus: "processed", privacyStatus: "public" },
            statistics: { viewCount: "999" },
          },
        ],
      });
    const adapter = createYouTubeMetadataAdapter({
      apiKey: createYouTubeApiKey("test-key"),
      fetcher,
    });

    const report = await adapter.refresh([video("video-a", STALE)], { now: NOW });

    expect(report.updates).toEqual([
      {
        videoId: "video-a",
        patch: {
          title: "API title",
          publishedAt: "2026-06-01T00:00:00Z",
          duration: "PT12M",
          privacyStatus: "public",
          uploadStatus: "processed",
          liveBroadcastContent: "none",
          availability: "available",
          etag: "etag-new",
          fetchedAt: NOW.toISOString(),
        },
      },
    ]);
  });

  it("uses If-None-Match and refreshes the fetched timestamp for 304", async () => {
    const requests: RequestLog[] = [];
    const fetcher: Fetcher = async (input, init) => {
      requests.push({ url: String(input), init });
      return response(null, 304);
    };
    const adapter = createYouTubeMetadataAdapter({
      apiKey: createYouTubeApiKey("test-key"),
      fetcher,
    });

    const report = await adapter.refresh([video("video-a", STALE, "etag-old")], { now: NOW });

    expect(new Headers(requests[0]?.init?.headers).get("if-none-match")).toBe("etag-old");
    expect(report.updates).toEqual([
      { videoId: "video-a", patch: { fetchedAt: NOW.toISOString() } },
    ]);
  });

  it("caps 429 retries and reports a rate-limited outcome", async () => {
    let requestCount = 0;
    const delays: number[] = [];
    const fetcher: Fetcher = async () => {
      requestCount += 1;
      return response({ error: { reason: "quotaExceeded" } }, 429);
    };
    const adapter = createYouTubeMetadataAdapter({
      apiKey: createYouTubeApiKey("test-key"),
      fetcher,
      maxRetries: 2,
      sleep: async (delay) => {
        delays.push(delay);
      },
    });

    const report = await adapter.refresh([video("video-a", STALE)], { now: NOW });

    expect(requestCount).toBe(3);
    expect(delays).toHaveLength(2);
    expect(report.failures).toEqual([
      { kind: "rate_limited", status: 429, videoIds: ["video-a"], attempts: 3 },
    ]);
    expect(report.updates).toEqual([]);
  });

  it("does not retry a 403 and preserves the existing metadata", async () => {
    let requestCount = 0;
    const fetcher: Fetcher = async () => {
      requestCount += 1;
      return response({ error: { reason: "forbidden" } }, 403);
    };
    const adapter = createYouTubeMetadataAdapter({
      apiKey: createYouTubeApiKey("test-key"),
      fetcher,
      maxRetries: 3,
    });

    const report = await adapter.refresh([video("video-a", STALE)], { now: NOW });

    expect(requestCount).toBe(1);
    expect(report.failures).toEqual([
      { kind: "forbidden", status: 403, videoIds: ["video-a"], attempts: 1 },
    ]);
    expect(report.updates).toEqual([]);
  });

  it("marks a requested ID absent from a 200 response as unavailable_unknown", async () => {
    const fetcher: Fetcher = async () =>
      response({
        items: [
          {
            id: "video-a",
            etag: "etag-a",
            snippet: { title: "Still available", publishedAt: "2026-06-01T00:00:00Z" },
            contentDetails: { duration: "PT2M" },
            status: { uploadStatus: "processed", privacyStatus: "public" },
          },
        ],
      });
    const adapter = createYouTubeMetadataAdapter({
      apiKey: createYouTubeApiKey("test-key"),
      fetcher,
    });

    const report = await adapter.refresh(
      [video("video-b", STALE), video("video-a", STALE)],
      { now: NOW },
    );

    expect(report.updates).toContainEqual({
      videoId: "video-b",
      patch: { availability: "unavailable_unknown", fetchedAt: NOW.toISOString() },
    });
  });

  it("treats exactly 30 days as refresh-due and keeps newer metadata untouched", () => {
    const plan = planYouTubeMetadataRefresh(
      [video("video-fresh", FRESH), video("video-due", "2026-06-14T00:00:00.000Z")],
      { now: NOW },
    );

    expect(plan.refreshDueVideoIds).toEqual(["video-due"]);
    expect(plan.skippedVideoIds).toEqual(["video-fresh"]);
    expect(plan.chunks).toEqual([["video-due"]]);
  });
});
