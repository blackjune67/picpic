"use client";

import {
  NAVER_MAP_APP_STORE_URL,
  NAVER_MAP_PLAY_STORE_URL,
  NAVER_MAP_WEB_URL,
  buildNaverMapUrls,
  type NaverMapPlace,
  type NaverMapUrls,
} from "./adapter";
export type { NaverMapPlace } from "./adapter";

export const IOS_APP_STORE_FALLBACK_DELAY_MS = 1_500 as const;
export const IOS_APP_STORE_FALLBACK_THRESHOLD_MS = 2_000 as const;

export type NaverMapPlatform = "ios" | "android" | "unsupported";

export type NaverMapFallback = {
  readonly webUrl: string;
  readonly address: string;
  readonly copyAddress: () => Promise<boolean>;
};

export type NaverMapActionResult =
  | {
      readonly kind: "handoff";
      readonly platform: "ios" | "android";
      readonly url: string;
    }
  | {
      readonly kind: "store";
      readonly platform: "ios" | "android";
      readonly url: string;
    }
  | {
      readonly kind: "fallback";
      readonly fallback: NaverMapFallback;
      readonly copyAddress: () => Promise<boolean>;
    };

export type NaverMapActionOptions = {
  readonly platform?: NaverMapPlatform | undefined;
  readonly navigate?: (url: string) => void;
  readonly schedule?: (callback: () => void, delayMs: number) => void;
  readonly now?: () => number;
  readonly copyAddress?: (address: string) => Promise<boolean>;
  readonly onNavigationBlocked?: (fallback: NaverMapFallback) => void;
};

type NaverMapRuntime = {
  readonly navigate: (url: string) => void;
  readonly schedule: (callback: () => void, delayMs: number) => void;
  readonly now: () => number;
  readonly copyAddress: (address: string) => Promise<boolean>;
};

function assertNever(value: never): never {
  throw new Error(`Unsupported NAVER Map platform: ${String(value)}`);
}

function detectPlatform(): NaverMapPlatform {
  if (typeof navigator === "undefined") {
    return "unsupported";
  }

  if (/Android/i.test(navigator.userAgent)) {
    return "android";
  }

  if (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }

  return "unsupported";
}

function navigateInBrowser(url: string): void {
  window.location.assign(url);
}

function scheduleInBrowser(callback: () => void, delayMs: number): void {
  window.setTimeout(callback, delayMs);
}

function copyAddressInBrowser(address: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.resolve(false);
  }

  return navigator.clipboard.writeText(address).then(
    () => true,
    () => false,
  );
}

function tryNavigate(
  navigate: (url: string) => void,
  url: string,
): boolean {
  try {
    navigate(url);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      return false;
    }
    throw error;
  }
}

function createFallback(
  place: NaverMapPlace,
  copyAddress: (address: string) => Promise<boolean>,
): NaverMapFallback {
  return {
    webUrl: NAVER_MAP_WEB_URL,
    address: place.address,
    copyAddress: () => copyAddress(place.address),
  };
}

function fallbackResult(
  fallback: NaverMapFallback,
  onNavigationBlocked: ((fallback: NaverMapFallback) => void) | undefined,
): NaverMapActionResult {
  onNavigationBlocked?.(fallback);
  return { kind: "fallback", fallback, copyAddress: fallback.copyAddress };
}

function handoffResult(
  platform: "ios" | "android",
  url: string,
): NaverMapActionResult {
  return { kind: "handoff", platform, url };
}

function storeResult(
  platform: "ios" | "android",
  url: string,
): NaverMapActionResult {
  return { kind: "store", platform, url };
}

function performAndroidTap(
  urls: NaverMapUrls,
  runtime: NaverMapRuntime,
  fallback: NaverMapFallback,
  onNavigationBlocked: ((fallback: NaverMapFallback) => void) | undefined,
): NaverMapActionResult {
  if (tryNavigate(runtime.navigate, urls.android)) {
    return handoffResult("android", urls.android);
  }

  if (tryNavigate(runtime.navigate, urls.playStore)) {
    return storeResult("android", NAVER_MAP_PLAY_STORE_URL);
  }

  return fallbackResult(fallback, onNavigationBlocked);
}

function performIosTap(
  urls: NaverMapUrls,
  runtime: NaverMapRuntime,
  fallback: NaverMapFallback,
  onNavigationBlocked: ((fallback: NaverMapFallback) => void) | undefined,
): Promise<NaverMapActionResult> {
  const clickedAt = runtime.now();

  if (!tryNavigate(runtime.navigate, urls.ios)) {
    if (tryNavigate(runtime.navigate, urls.appStore)) {
      return Promise.resolve(storeResult("ios", NAVER_MAP_APP_STORE_URL));
    }

    return Promise.resolve(fallbackResult(fallback, onNavigationBlocked));
  }

  return new Promise((resolve) => {
    runtime.schedule(() => {
      if (runtime.now() - clickedAt < IOS_APP_STORE_FALLBACK_THRESHOLD_MS) {
        if (tryNavigate(runtime.navigate, urls.appStore)) {
          resolve(storeResult("ios", NAVER_MAP_APP_STORE_URL));
          return;
        }

        resolve(fallbackResult(fallback, onNavigationBlocked));
        return;
      }

      resolve(handoffResult("ios", urls.ios));
    }, IOS_APP_STORE_FALLBACK_DELAY_MS);
  });
}

export function createNaverMapTapAction(
  place: NaverMapPlace,
  options?: NaverMapActionOptions,
): () => Promise<NaverMapActionResult> {
  const urls = buildNaverMapUrls(place);
  const platform = options?.platform ?? detectPlatform();
  const runtime: NaverMapRuntime = {
    navigate: options?.navigate ?? navigateInBrowser,
    schedule: options?.schedule ?? scheduleInBrowser,
    now: options?.now ?? Date.now,
    copyAddress: options?.copyAddress ?? copyAddressInBrowser,
  };
  const fallback = createFallback(place, runtime.copyAddress);

  return async () => {
    switch (platform) {
      case "ios":
        return performIosTap(
          urls,
          runtime,
          fallback,
          options?.onNavigationBlocked,
        );
      case "android":
        return performAndroidTap(
          urls,
          runtime,
          fallback,
          options?.onNavigationBlocked,
        );
      case "unsupported":
        return fallbackResult(fallback, options?.onNavigationBlocked);
      default:
        return assertNever(platform);
    }
  };
}
