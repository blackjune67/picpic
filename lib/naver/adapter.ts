export const NAVER_MAP_ANDROID_PACKAGE = "com.nhn.android.nmap" as const;
export const NAVER_MAP_APP_STORE_URL =
  "http://itunes.apple.com/app/id311867728?mt=8" as const;
export const NAVER_MAP_PLAY_STORE_URL =
  "market://details?id=com.nhn.android.nmap" as const;
export const NAVER_MAP_WEB_URL = "https://map.naver.com/" as const;

export type NaverMapPlace = {
  readonly name: string;
  readonly address: string;
  readonly appName: string;
  readonly latitude?: number;
  readonly longitude?: number;
};

export type NaverMapUrls = {
  readonly ios: string;
  readonly android: string;
  readonly appStore: typeof NAVER_MAP_APP_STORE_URL;
  readonly playStore: typeof NAVER_MAP_PLAY_STORE_URL;
  readonly web: typeof NAVER_MAP_WEB_URL;
};

function buildPlaceQuery(place: NaverMapPlace): string {
  const coordinates =
    place.latitude !== undefined &&
    place.longitude !== undefined &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude)
      ? [`lat=${place.latitude}`, `lng=${place.longitude}`]
      : [];

  return [
    `query=${encodeURIComponent(place.name)}`,
    ...coordinates,
    `appname=${encodeURIComponent(place.appName)}`,
  ].join("&");
}

export function buildNaverMapIosUrl(place: NaverMapPlace): string {
  return `nmap://place/search?${buildPlaceQuery(place)}`;
}

export function buildNaverMapAndroidIntentUrl(place: NaverMapPlace): string {
  return `intent://place/search?${buildPlaceQuery(place)}#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=${NAVER_MAP_ANDROID_PACKAGE};end`;
}

export function buildNaverMapUrls(place: NaverMapPlace): NaverMapUrls {
  return {
    ios: buildNaverMapIosUrl(place),
    android: buildNaverMapAndroidIntentUrl(place),
    appStore: NAVER_MAP_APP_STORE_URL,
    playStore: NAVER_MAP_PLAY_STORE_URL,
    web: NAVER_MAP_WEB_URL,
  };
}
