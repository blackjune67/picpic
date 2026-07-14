import type {
  Fetcher,
  Sleep,
  YouTubeApiKey,
  YouTubeMetadata,
  YouTubeMetadataAdapter,
  YouTubeMetadataAdapterConfig,
  YouTubeMetadataUpdate,
  YouTubeMetadataRecord,
  YouTubeMetadataRefreshOptions,
  YouTubeMetadataStore,
  YouTubeRefreshFailure,
  YouTubeRefreshPlan,
  YouTubeRequestSummary,
} from "./types";
import {
  YOUTUBE_API_ENDPOINT,
  YOUTUBE_MAX_CHUNK_SIZE,
  YOUTUBE_MAX_RETRIES,
  YOUTUBE_REFRESH_MAX_AGE_MS,
  YOUTUBE_RESPONSE_FIELDS,
  YOUTUBE_VIDEO_PARTS,
} from "./types";

type ApiItem = {
  readonly id: string;
  readonly etag: string | null;
  readonly title: string | null;
  readonly publishedAt: string | null;
  readonly duration: string | null;
  readonly privacyStatus: string | null;
  readonly uploadStatus: string | null;
  readonly liveBroadcastContent: string | null;
};

type ApiResponse = {
  readonly items: readonly ApiItem[];
};

type RequestResult =
  | { readonly kind: "response"; readonly response: Response; readonly attempts: number }
  | { readonly kind: "network_error"; readonly attempts: number; readonly message: string };

export class MissingYouTubeApiKeyError extends Error {
  readonly name = "MissingYouTubeApiKeyError";

  constructor() {
    super("YOUTUBE_API_KEY is required for live YouTube sync");
  }
}

export class InvalidYouTubeResponseError extends Error {
  readonly name = "InvalidYouTubeResponseError";

  constructor(readonly reason: string) {
    super(`Invalid YouTube API response: ${reason}`);
  }
}

export function createYouTubeApiKey(rawValue: string): YouTubeApiKey {
  const value = rawValue.trim();
  if (value.length === 0) {
    throw new MissingYouTubeApiKeyError();
  }
  return { value };
}

export function isYouTubeMetadataRefreshDue(
  metadata: YouTubeMetadata,
  now: Date,
  maxAgeMs = YOUTUBE_REFRESH_MAX_AGE_MS,
): boolean {
  if (metadata.fetchedAt === null) {
    return true;
  }
  const fetchedAtMs = Date.parse(metadata.fetchedAt);
  return !Number.isFinite(fetchedAtMs) || now.getTime() - fetchedAtMs >= maxAgeMs;
}

export function planYouTubeMetadataRefresh(
  records: readonly YouTubeMetadataRecord[],
  options: YouTubeMetadataRefreshOptions = {},
): YouTubeRefreshPlan {
  const now = options.now ?? new Date();
  const maxAgeMs = options.maxAgeMs ?? YOUTUBE_REFRESH_MAX_AGE_MS;
  const chunkSize = normalizeChunkSize(options.chunkSize ?? YOUTUBE_MAX_CHUNK_SIZE);
  const refreshDueVideoIds = sortUnique(
    records
      .filter((record) => isYouTubeMetadataRefreshDue(record.metadata, now, maxAgeMs))
      .map((record) => record.videoId),
  );
  const skippedVideoIds = sortUnique(
    records
      .filter((record) => !isYouTubeMetadataRefreshDue(record.metadata, now, maxAgeMs))
      .map((record) => record.videoId),
  );

  return {
    refreshDueVideoIds,
    skippedVideoIds,
    chunks: chunk(refreshDueVideoIds, chunkSize),
  };
}

export function createYouTubeMetadataAdapter(
  config: YouTubeMetadataAdapterConfig,
): YouTubeMetadataAdapter {
  const fetcher = config.fetcher ?? globalThis.fetch;
  const sleep = config.sleep ?? defaultSleep;
  const endpoint = config.endpoint ?? YOUTUBE_API_ENDPOINT;

  return {
    refresh: async (records, options = {}) => {
      const now = options.now ?? new Date();
      const plan = planYouTubeMetadataRefresh(records, {
        now,
        ...(options.maxAgeMs === undefined ? {} : { maxAgeMs: options.maxAgeMs }),
        ...(options.chunkSize === undefined && config.chunkSize === undefined
          ? {}
          : { chunkSize: options.chunkSize ?? config.chunkSize }),
      });
      const byVideoId = new Map(records.map((record) => [record.videoId, record]));
      const updates: YouTubeMetadataUpdate[] = [];
      const failures: YouTubeRefreshFailure[] = [];
      const requests: YouTubeRequestSummary[] = [];
      const maxRetries = normalizeRetries(options.maxRetries ?? config.maxRetries);
      const retryDelayMs = normalizeRetryDelay(options.retryDelayMs ?? config.retryDelayMs);

      for (const videoIds of plan.chunks) {
        const chunkRecords = videoIds.flatMap((videoId) => {
          const record = byVideoId.get(videoId);
          return record === undefined ? [] : [record];
        });
        const requestResult = await requestChunk({
          apiKey: config.apiKey,
          endpoint,
          records: chunkRecords,
          fetcher,
          sleep,
          maxRetries,
          retryDelayMs,
        });

        switch (requestResult.kind) {
          case "network_error":
            requests.push({ videoIds, attempts: requestResult.attempts, status: null });
            failures.push({
              kind: "network_error",
              videoIds,
              attempts: requestResult.attempts,
              message: requestResult.message,
            });
            break;
          case "response":
            requests.push({
              videoIds,
              attempts: requestResult.attempts,
              status: requestResult.response.status,
            });
            if (requestResult.response.status === 304) {
              updates.push(...notModifiedUpdates(videoIds, requestResult.response, now));
              break;
            }
            if (requestResult.response.status !== 200) {
              failures.push(httpFailure(videoIds, requestResult));
              break;
            }
            try {
              const body: unknown = await requestResult.response.json();
              const parsed = parseApiResponse(body);
              updates.push(...metadataUpdates(videoIds, parsed, requestResult.response, now));
            } catch (error) {
              failures.push({
                kind: "invalid_response",
                videoIds,
                attempts: requestResult.attempts,
                message: error instanceof Error ? error.message : "unknown response error",
              });
            }
            break;
          default:
            return assertNever(requestResult);
        }
      }

      return {
        refreshDueVideoIds: plan.refreshDueVideoIds,
        skippedVideoIds: plan.skippedVideoIds,
        chunks: plan.chunks,
        updates,
        failures,
        requests,
      };
    },
    sync: async (store: YouTubeMetadataStore, options = {}) => {
      const records = await store.listVideoMetadata();
      const report = await createYouTubeMetadataAdapter(config).refresh(records, options);
      if (report.updates.length > 0) {
        await store.updateMetadata(report.updates);
      }
      return report;
    },
  };
}

async function requestChunk(input: {
  readonly apiKey: YouTubeApiKey;
  readonly endpoint: string;
  readonly records: readonly YouTubeMetadataRecord[];
  readonly fetcher: Fetcher;
  readonly sleep: Sleep;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
}): Promise<RequestResult> {
  const url = buildRequestUrl(input.endpoint, input.apiKey, input.records.map((record) => record.videoId));
  const commonEtag = getCommonEtag(input.records);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (commonEtag !== undefined) {
    headers["If-None-Match"] = commonEtag;
  }

  for (let retry = 0; retry <= input.maxRetries; retry += 1) {
    try {
      const response = await input.fetcher(url, { method: "GET", headers });
      if (!isRetriableStatus(response.status) || retry === input.maxRetries) {
        return { kind: "response", response, attempts: retry + 1 };
      }
      await input.sleep(backoff(input.retryDelayMs, retry));
    } catch (error) {
      if (retry === input.maxRetries) {
        return {
          kind: "network_error",
          attempts: retry + 1,
          message: error instanceof Error ? error.message : "unknown network error",
        };
      }
      await input.sleep(backoff(input.retryDelayMs, retry));
    }
  }

  throw new Error("YouTube request retry loop exhausted unexpectedly");
}

function buildRequestUrl(endpoint: string, apiKey: YouTubeApiKey, videoIds: readonly string[]): string {
  const url = new URL(endpoint);
  url.searchParams.set("part", YOUTUBE_VIDEO_PARTS);
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("fields", YOUTUBE_RESPONSE_FIELDS);
  url.searchParams.set("key", apiKey.value);
  return url.toString();
}

function getCommonEtag(records: readonly YouTubeMetadataRecord[]): string | undefined {
  const firstEtag = records[0]?.metadata.etag;
  if (firstEtag === null || firstEtag === undefined) {
    return undefined;
  }
  return records.every((record) => record.metadata.etag === firstEtag) ? firstEtag : undefined;
}

function notModifiedUpdates(
  videoIds: readonly string[],
  response: Response,
  now: Date,
): YouTubeMetadataUpdate[] {
  const etag = response.headers.get("etag");
  return videoIds.map((videoId) => ({
    videoId,
    patch: etag === null ? { fetchedAt: now.toISOString() } : { fetchedAt: now.toISOString(), etag },
  }));
}

function metadataUpdates(
  videoIds: readonly string[],
  response: ApiResponse,
  rawResponse: Response,
  now: Date,
): YouTubeMetadataUpdate[] {
  const itemsById = new Map(response.items.map((item) => [item.id, item]));
  const responseEtag = rawResponse.headers.get("etag");
  return videoIds.map((videoId) => {
    const item = itemsById.get(videoId);
    if (item === undefined) {
      return { videoId, patch: { availability: "unavailable_unknown", fetchedAt: now.toISOString() } };
    }
    const etag = item.etag ?? responseEtag;
    return {
      videoId,
      patch: {
        title: item.title,
        publishedAt: item.publishedAt,
        duration: item.duration,
        privacyStatus: item.privacyStatus,
        uploadStatus: item.uploadStatus,
        liveBroadcastContent: item.liveBroadcastContent,
        availability: "available",
        ...(etag === null ? {} : { etag }),
        fetchedAt: now.toISOString(),
      },
    };
  });
}

function httpFailure(
  videoIds: readonly string[],
  result: Extract<RequestResult, { readonly kind: "response" }>,
): YouTubeRefreshFailure {
  if (result.response.status === 403) {
    return { kind: "forbidden", status: 403, videoIds, attempts: result.attempts };
  }
  if (result.response.status === 429) {
    return { kind: "rate_limited", status: 429, videoIds, attempts: result.attempts };
  }
  return {
    kind: "upstream_error",
    status: result.response.status,
    videoIds,
    attempts: result.attempts,
  };
}

function parseApiResponse(value: unknown): ApiResponse {
  const record = readRecord(value, "response");
  const items = record["items"];
  if (!Array.isArray(items)) {
    throw new InvalidYouTubeResponseError("items must be an array");
  }
  return { items: items.map(parseApiItem) };
}

function parseApiItem(value: unknown): ApiItem {
  const record = readRecord(value, "item");
  const snippet = readOptionalRecord(record["snippet"], "snippet");
  const contentDetails = readOptionalRecord(record["contentDetails"], "contentDetails");
  const status = readOptionalRecord(record["status"], "status");
  return {
    id: readRequiredString(record, "id"),
    etag: readOptionalString(record, "etag"),
    title: readOptionalString(snippet, "title"),
    publishedAt: readOptionalString(snippet, "publishedAt"),
    liveBroadcastContent: readOptionalString(snippet, "liveBroadcastContent"),
    duration: readOptionalString(contentDetails, "duration"),
    uploadStatus: readOptionalString(status, "uploadStatus"),
    privacyStatus: readOptionalString(status, "privacyStatus"),
  };
}

function readRecord(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidYouTubeResponseError(`${label} must be an object`);
  }
  return Object.fromEntries(Object.entries(value));
}

function readOptionalRecord(value: unknown, label: string): Record<string, unknown> {
  return value === undefined ? {} : readRecord(value, label);
}

function readRequiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidYouTubeResponseError(`${key} must be a non-empty string`);
  }
  return value;
}

function readOptionalString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    throw new InvalidYouTubeResponseError(`${key} must be a string when present`);
  }
  return value;
}

function sortUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

function chunk(values: readonly string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let offset = 0; offset < values.length; offset += size) {
    chunks.push(values.slice(offset, offset + size));
  }
  return chunks;
}

function normalizeChunkSize(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > YOUTUBE_MAX_CHUNK_SIZE) {
    throw new RangeError(`YouTube chunk size must be an integer from 1 to ${YOUTUBE_MAX_CHUNK_SIZE}`);
  }
  return value;
}

function normalizeRetries(value: number | undefined): number {
  return Math.min(YOUTUBE_MAX_RETRIES, Math.max(0, Math.floor(value ?? 2)));
}

function normalizeRetryDelay(value: number | undefined): number {
  return Math.max(0, Math.floor(value ?? 250));
}

function isRetriableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

function backoff(baseDelayMs: number, retry: number): number {
  return Math.min(baseDelayMs * 2 ** retry, 5_000);
}

function defaultSleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function assertNever(value: never): never {
  throw new Error(`Unexpected YouTube request result: ${String(value)}`);
}
