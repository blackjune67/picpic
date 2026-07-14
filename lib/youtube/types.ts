export const YOUTUBE_VIDEO_PARTS = "snippet,contentDetails,status" as const;
export const YOUTUBE_RESPONSE_FIELDS =
  "etag,items(id,etag,snippet(publishedAt,title,liveBroadcastContent),contentDetails(duration),status(uploadStatus,privacyStatus))" as const;
export const YOUTUBE_API_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos" as const;
export const YOUTUBE_MAX_CHUNK_SIZE = 50 as const;
export const YOUTUBE_MAX_RETRIES = 3 as const;
export const YOUTUBE_REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type MetadataAvailability = "available" | "unavailable_unknown";

export type YouTubeApiKey = {
  readonly value: string;
};

export type YouTubeMetadata = {
  readonly title: string | null;
  readonly publishedAt: string | null;
  readonly duration: string | null;
  readonly privacyStatus: string | null;
  readonly uploadStatus: string | null;
  readonly liveBroadcastContent: string | null;
  readonly availability: MetadataAvailability;
  readonly etag: string | null;
  readonly fetchedAt: string | null;
};

export type YouTubeMetadataRecord = {
  readonly videoId: string;
  readonly metadata: YouTubeMetadata;
};

export type YouTubeMetadataPatch = {
  readonly title?: string | null;
  readonly publishedAt?: string | null;
  readonly duration?: string | null;
  readonly privacyStatus?: string | null;
  readonly uploadStatus?: string | null;
  readonly liveBroadcastContent?: string | null;
  readonly availability?: MetadataAvailability;
  readonly etag?: string | null;
  readonly fetchedAt: string;
};

export type YouTubeMetadataUpdate = {
  readonly videoId: string;
  readonly patch: YouTubeMetadataPatch;
};

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type Sleep = (delayMs: number) => Promise<void>;

export type RequestLog = {
  readonly url: string;
  readonly init: RequestInit | undefined;
};

export type YouTubeMetadataAdapterConfig = {
  readonly apiKey: YouTubeApiKey;
  readonly endpoint?: string;
  readonly fetcher?: Fetcher;
  readonly sleep?: Sleep;
  readonly chunkSize?: number;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
};

export type YouTubeMetadataRefreshOptions = {
  readonly now?: Date;
  readonly maxAgeMs?: number;
  readonly chunkSize?: number;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
};

export type YouTubeRefreshPlan = {
  readonly refreshDueVideoIds: readonly string[];
  readonly skippedVideoIds: readonly string[];
  readonly chunks: readonly (readonly string[])[];
};

export type YouTubeRefreshFailure =
  | {
      readonly kind: "forbidden";
      readonly status: 403;
      readonly videoIds: readonly string[];
      readonly attempts: number;
    }
  | {
      readonly kind: "rate_limited";
      readonly status: 429;
      readonly videoIds: readonly string[];
      readonly attempts: number;
    }
  | {
      readonly kind: "upstream_error";
      readonly status: number;
      readonly videoIds: readonly string[];
      readonly attempts: number;
    }
  | {
      readonly kind: "network_error" | "invalid_response";
      readonly videoIds: readonly string[];
      readonly attempts: number;
      readonly message: string;
    };

export type YouTubeRequestSummary = {
  readonly videoIds: readonly string[];
  readonly attempts: number;
  readonly status: number | null;
};

export type YouTubeRefreshReport = {
  readonly refreshDueVideoIds: readonly string[];
  readonly skippedVideoIds: readonly string[];
  readonly chunks: readonly (readonly string[])[];
  readonly updates: readonly YouTubeMetadataUpdate[];
  readonly failures: readonly YouTubeRefreshFailure[];
  readonly requests: readonly YouTubeRequestSummary[];
};

export interface YouTubeMetadataStore {
  listVideoMetadata(): Promise<readonly YouTubeMetadataRecord[]>;
  updateMetadata(updates: readonly YouTubeMetadataUpdate[]): Promise<void>;
}

export interface YouTubeMetadataAdapter {
  refresh(
    records: readonly YouTubeMetadataRecord[],
    options?: YouTubeMetadataRefreshOptions,
  ): Promise<YouTubeRefreshReport>;
  sync(
    store: YouTubeMetadataStore,
    options?: YouTubeMetadataRefreshOptions,
  ): Promise<YouTubeRefreshReport>;
}
