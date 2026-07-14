import type { EditorialRecord } from "../content";

export type CatalogFilter = {
  readonly query?: string;
  readonly channel?: string;
  readonly region?: string;
};

export type CatalogAppearance = {
  readonly id: string;
  readonly channelSlug: string;
  readonly channelName: string;
  readonly episodeTitle: string;
  readonly youtubeVideoId: string;
  readonly publishedAt: string;
  readonly visitOrder: number;
  readonly verification: EditorialRecord["verification"]["status"];
};

export type CatalogRestaurant = {
  readonly slug: string;
  readonly name: string;
  readonly district: string;
  readonly address: string;
  readonly regionSlug: string;
  readonly editorialNote: string;
  readonly imagePath: string;
  readonly imageAttribution: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly appearances: readonly CatalogAppearance[];
};

export type CatalogChannel = {
  readonly slug: string;
  readonly name: string;
  readonly status: "active" | "future_fixture";
};

export type CatalogRegion = {
  readonly slug: string;
  readonly name: string;
};

export type Catalog = {
  readonly channels: readonly CatalogChannel[];
  readonly regions: readonly CatalogRegion[];
  readonly restaurants: readonly CatalogRestaurant[];
};

export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
}
