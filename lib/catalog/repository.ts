import catalogImport from "../../data/import/catalog.json";
import { parseEditorialImport, type EditorialImport } from "../content";
import type { Catalog, CatalogAppearance, CatalogFilter, CatalogRestaurant } from "./domain";
import { normalizeSearch } from "./domain";

const editorialCatalog = parseEditorialImport(catalogImport);

const imageByRestaurant: Readonly<Record<string, string>> = {
  "대림국수": "/food/noodle-bowl.svg",
  "할매곱창": "/food/gopchang.svg",
  "온센": "/food/udon.svg",
  "밀면집": "/food/milmyeon.svg",
};

function toRestaurantRecords(input: EditorialImport): readonly CatalogRestaurant[] {
  const byKey = new Map<string, CatalogRestaurant>();
  for (const record of input.records) {
    const key = `${record.curatedFields.restaurantName}:${record.curatedFields.address}`;
    const appearance: CatalogAppearance = {
      id: record.appearance.id,
      channelSlug: record.channel.slug,
      channelName: record.channel.name,
      episodeTitle: record.appearance.episodeTitle,
      youtubeVideoId: record.appearance.youtubeVideoId,
      publishedAt: record.appearance.publishedAt,
      visitOrder: record.appearance.visitOrder,
      verification: record.verification.status,
    };
    const existing = byKey.get(key);
    if (existing === undefined) {
      byKey.set(key, {
        slug: record.slug,
        name: record.curatedFields.restaurantName,
        district: record.curatedFields.district,
        address: record.curatedFields.address,
        regionSlug: "seoul",
        editorialNote: record.curatedFields.editorialNote,
        imagePath: imageByRestaurant[record.curatedFields.restaurantName] ?? "/food/noodle-bowl.svg",
        imageAttribution: record.curatedFields.media.credit,
        latitude: record.curatedFields.coordinates.latitude,
        longitude: record.curatedFields.coordinates.longitude,
        appearances: [appearance],
      });
      continue;
    }
    byKey.set(key, { ...existing, appearances: [...existing.appearances, appearance] });
  }
  return [...byKey.values()].map((restaurant) => ({
    ...restaurant,
    appearances: [...restaurant.appearances].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt) || left.visitOrder - right.visitOrder),
  }));
}

const fullCatalog: Catalog = {
  channels: [...new Map(editorialCatalog.records.map((record) => [record.channel.slug, record.channel])).values()],
  regions: [
    { slug: "seoul", name: "서울" },
    { slug: "gyeonggi", name: "경기" },
    { slug: "busan", name: "부산" },
    { slug: "jeju", name: "제주" },
  ],
  restaurants: toRestaurantRecords(editorialCatalog),
};

export interface CatalogRepository {
  list(filters?: CatalogFilter): Promise<Catalog>;
  findBySlug(slug: string): Promise<CatalogRestaurant | null>;
}

function matchesFilter(restaurant: CatalogRestaurant, filter: CatalogFilter): boolean {
  const query = normalizeSearch(filter.query ?? "");
  const queryMatches = query.length === 0 || normalizeSearch(`${restaurant.name} ${restaurant.district} ${restaurant.address}`).includes(query);
  const regionMatches = filter.region === undefined || filter.region === restaurant.regionSlug;
  const channelMatches = filter.channel === undefined || restaurant.appearances.some((appearance) => appearance.channelSlug === filter.channel);
  return queryMatches && regionMatches && channelMatches;
}

export const fixtureCatalogRepository: CatalogRepository = {
  async list(filters = {}) {
    return { ...fullCatalog, restaurants: fullCatalog.restaurants.filter((restaurant) => matchesFilter(restaurant, filters)) };
  },
  async findBySlug(slug) {
    return fullCatalog.restaurants.find((restaurant) => restaurant.slug === slug) ?? null;
  },
};
