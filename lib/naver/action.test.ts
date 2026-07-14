import { describe, expect, it, vi } from "vitest";
import {
  IOS_APP_STORE_FALLBACK_DELAY_MS,
  IOS_APP_STORE_FALLBACK_THRESHOLD_MS,
  createNaverMapTapAction,
  type NaverMapActionOptions,
  type NaverMapPlace,
} from "./action";
import {
  NAVER_MAP_APP_STORE_URL,
  NAVER_MAP_PLAY_STORE_URL,
  NAVER_MAP_WEB_URL,
  buildNaverMapUrls,
} from "./adapter";

const place = {
  name: "맛있는 집 & Bar",
  address: "서울특별시 종로구 세종대로 1",
  appName: "picpic-web",
  latitude: 37.5666103,
  longitude: 126.9783882,
} satisfies NaverMapPlace;

type Harness = {
  readonly navigate: ReturnType<typeof vi.fn<(url: string) => void>>;
  readonly schedule: ReturnType<
    typeof vi.fn<(callback: () => void, delayMs: number) => void>
  >;
  readonly now: ReturnType<typeof vi.fn<() => number>>;
  readonly copyAddress: ReturnType<
    typeof vi.fn<(address: string) => Promise<boolean>>
  >;
  readonly blocked: ReturnType<
    typeof vi.fn<(fallback: { readonly webUrl: string; readonly address: string }) => void>
  >;
  readonly options: NaverMapActionOptions;
};

function createHarness(platform: NaverMapActionOptions["platform"]): Harness {
  const navigate = vi.fn<(url: string) => void>();
  const schedule = vi.fn<(callback: () => void, delayMs: number) => void>();
  const now = vi.fn<() => number>(() => 2_000);
  const copyAddress = vi.fn<(address: string) => Promise<boolean>>(
    async () => true,
  );
  const blocked = vi.fn<
    (fallback: { readonly webUrl: string; readonly address: string }) => void
  >();

  return {
    navigate,
    schedule,
    now,
    copyAddress,
    blocked,
    options: {
      platform,
      navigate,
      schedule,
      now,
      copyAddress,
      onNavigationBlocked: blocked,
    },
  };
}

describe("NAVER Map tap action", () => {
  it("does not navigate until the returned action is tapped", async () => {
    // Given: an iOS action with deterministic browser seams
    const harness = createHarness("ios");
    harness.schedule.mockImplementation((callback) => callback());
    harness.now.mockReturnValueOnce(0).mockReturnValue(2_000);
    const action = createNaverMapTapAction(place, harness.options);

    // When: the action is created, before the user taps
    expect(harness.navigate).not.toHaveBeenCalled();

    // When: the user taps the action
    await action();

    // Then: exactly the iOS handoff is attempted
    expect(harness.navigate).toHaveBeenCalledTimes(1);
    expect(harness.navigate).toHaveBeenCalledWith(buildNaverMapUrls(place).ios);
  });

  it.each([
    {
      platform: "ios" as const,
      blocked: true,
      elapsedMs: IOS_APP_STORE_FALLBACK_THRESHOLD_MS - 1,
      expectedUrl: NAVER_MAP_APP_STORE_URL,
      expectedKind: "store" as const,
    },
    {
      platform: "ios" as const,
      blocked: false,
      elapsedMs: IOS_APP_STORE_FALLBACK_THRESHOLD_MS,
      expectedUrl: buildNaverMapUrls(place).ios,
      expectedKind: "handoff" as const,
    },
    {
      platform: "android" as const,
      blocked: false,
      elapsedMs: 0,
      expectedUrl: buildNaverMapUrls(place).android,
      expectedKind: "handoff" as const,
    },
  ])(
    "handles $platform navigation with blocked=$blocked and elapsed=$elapsedMs",
    async ({ platform, blocked, elapsedMs, expectedUrl, expectedKind }) => {
      // Given: a tap action and a platform navigation outcome
      const harness = createHarness(platform);
      harness.now.mockReturnValueOnce(1_000).mockReturnValue(1_000 + elapsedMs);
      harness.navigate.mockImplementation((url) => {
        if (blocked && url !== NAVER_MAP_APP_STORE_URL) {
          throw new Error("navigation blocked");
        }
      });
      harness.schedule.mockImplementation((callback, delayMs) => {
        expect(delayMs).toBe(IOS_APP_STORE_FALLBACK_DELAY_MS);
        callback();
      });
      const action = createNaverMapTapAction(place, harness.options);

      // When: the user taps the action
      const result = await action();

      // Then: the matrix selects the exact handoff or store target
      expect(harness.navigate).toHaveBeenCalledWith(expectedUrl);
      expect(result.kind).toBe(expectedKind);
    },
  );

  it("falls back to the Play Store when Android navigation is synchronously blocked", async () => {
    // Given: Android's Intent target cannot be handed to the browser
    const harness = createHarness("android");
    harness.navigate.mockImplementation((url) => {
      if (url !== NAVER_MAP_PLAY_STORE_URL) {
        throw new Error("navigation blocked");
      }
    });
    const action = createNaverMapTapAction(place, harness.options);

    // When: the user taps the action
    const result = await action();

    // Then: the official package store fallback is attempted
    expect(harness.navigate).toHaveBeenNthCalledWith(2, NAVER_MAP_PLAY_STORE_URL);
    expect(result).toEqual({ kind: "store", platform: "android", url: NAVER_MAP_PLAY_STORE_URL });
  });

  it("exposes generic web and address-copy fallback when navigation is unsupported", async () => {
    // Given: an unsupported platform and a copy-capable fallback seam
    const harness = createHarness("unsupported");
    const action = createNaverMapTapAction(place, harness.options);

    // When: the user taps the action
    const result = await action();

    // Then: no deep link is attempted and the fallback remains user-controlled
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.blocked).toHaveBeenCalledTimes(1);
    const [fallback] = harness.blocked.mock.calls[0] ?? [];
    expect(fallback).toMatchObject({
      webUrl: NAVER_MAP_WEB_URL,
      address: place.address,
    });
    expect(result.kind).toBe("fallback");
    if (result.kind === "fallback") {
      await result.copyAddress();
    }
    expect(harness.copyAddress).toHaveBeenCalledWith(place.address);
  });
});
