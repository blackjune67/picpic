import { describe, expect, it } from "vitest";
import {
  NAVER_MAP_ANDROID_PACKAGE,
  NAVER_MAP_APP_STORE_URL,
  NAVER_MAP_PLAY_STORE_URL,
  NAVER_MAP_WEB_URL,
  buildNaverMapAndroidIntentUrl,
  buildNaverMapIosUrl,
  buildNaverMapUrls,
  type NaverMapPlace,
} from "./adapter";

const APP_NAME = "https://picpic.example/app?source=맛집&tab=1";

const basePlace = {
  name: "서울역 3번 출구 & 카페? #1/2",
  address: "서울특별시 중구 세종대로 110",
  appName: APP_NAME,
} satisfies NaverMapPlace;

describe("NAVER Map URL adapter", () => {
  it.each([
    {
      label: "verified coordinates",
      place: {
        ...basePlace,
        latitude: 37.5666103,
        longitude: 126.9783882,
      },
      ios:
        "nmap://place/search?query=%EC%84%9C%EC%9A%B8%EC%97%AD%203%EB%B2%88%20%EC%B6%9C%EA%B5%AC%20%26%20%EC%B9%B4%ED%8E%98%3F%20%231%2F2&lat=37.5666103&lng=126.9783882&appname=https%3A%2F%2Fpicpic.example%2Fapp%3Fsource%3D%EB%A7%9B%EC%A7%91%26tab%3D1",
      android:
        "intent://place/search?query=%EC%84%9C%EC%9A%B8%EC%97%AD%203%EB%B2%88%20%EC%B6%9C%EA%B5%AC%20%26%20%EC%B9%B4%ED%8E%98%3F%20%231%2F2&lat=37.5666103&lng=126.9783882&appname=https%3A%2F%2Fpicpic.example%2Fapp%3Fsource%3D%EB%A7%9B%EC%A7%91%26tab%3D1#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end",
    },
    {
      label: "missing coordinates",
      place: basePlace,
      ios:
        "nmap://place/search?query=%EC%84%9C%EC%9A%B8%EC%97%AD%203%EB%B2%88%20%EC%B6%9C%EA%B5%AC%20%26%20%EC%B9%B4%ED%8E%98%3F%20%231%2F2&appname=https%3A%2F%2Fpicpic.example%2Fapp%3Fsource%3D%EB%A7%9B%EC%A7%91%26tab%3D1",
      android:
        "intent://place/search?query=%EC%84%9C%EC%9A%B8%EC%97%AD%203%EB%B2%88%20%EC%B6%9C%EA%B5%AC%20%26%20%EC%B9%B4%ED%8E%98%3F%20%231%2F2&appname=https%3A%2F%2Fpicpic.example%2Fapp%3Fsource%3D%EB%A7%9B%EC%A7%91%26tab%3D1#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end",
    },
    {
      label: "partial coordinates degrade to search",
      place: { ...basePlace, latitude: 37.5666103 },
      ios:
        "nmap://place/search?query=%EC%84%9C%EC%9A%B8%EC%97%AD%203%EB%B2%88%20%EC%B6%9C%EA%B5%AC%20%26%20%EC%B9%B4%ED%8E%98%3F%20%231%2F2&appname=https%3A%2F%2Fpicpic.example%2Fapp%3Fsource%3D%EB%A7%9B%EC%A7%91%26tab%3D1",
      android:
        "intent://place/search?query=%EC%84%9C%EC%9A%B8%EC%97%AD%203%EB%B2%88%20%EC%B6%9C%EA%B5%AC%20%26%20%EC%B9%B4%ED%8E%98%3F%20%231%2F2&appname=https%3A%2F%2Fpicpic.example%2Fapp%3Fsource%3D%EB%A7%9B%EC%A7%91%26tab%3D1#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end",
    },
  ])("builds the $label contract", ({ place, ios, android }) => {
    // Given: a verified place, a search-only place, or an incomplete coordinate pair
    // When: the platform-specific NAVER URLs are built
    const urls = buildNaverMapUrls(place);

    // Then: only the complete coordinate pair is included, and every user value is encoded
    expect(urls.ios).toBe(ios);
    expect(urls.android).toBe(android);
    expect(buildNaverMapIosUrl(place)).toBe(ios);
    expect(buildNaverMapAndroidIntentUrl(place)).toBe(android);
  });

  it("exposes only unparameterized generic web fallback and official store contracts", () => {
    // Given: the public NAVER Map app handoff contract
    const urls = buildNaverMapUrls(basePlace);

    // When: fallback targets are read
    // Then: the web fallback has no invented place parameters and Android names its package
    expect(urls.web).toBe(NAVER_MAP_WEB_URL);
    expect(urls.appStore).toBe(NAVER_MAP_APP_STORE_URL);
    expect(urls.playStore).toBe(NAVER_MAP_PLAY_STORE_URL);
    expect(urls.android).toContain(`package=${NAVER_MAP_ANDROID_PACKAGE}`);
    expect(urls.web).toBe("https://map.naver.com/");
    expect(urls.web).not.toContain("?");
    expect(urls.web).not.toContain("/p/");
  });
});
