import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fixtureCatalogRepository } from "@/lib/catalog";
import { RestaurantDetailClient } from "./restaurant-detail-client";

type RestaurantPageProps = { readonly params: Promise<{ readonly slug: string }> };

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await fixtureCatalogRepository.findBySlug(slug);
  return restaurant === null ? { title: "맛집을 찾을 수 없어요 | 픽픽" } : { title: `${restaurant.name} | 픽픽`, description: restaurant.editorialNote };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const restaurant = await fixtureCatalogRepository.findBySlug(slug);
  if (restaurant === null) notFound();
  return <RestaurantDetailClient restaurant={restaurant} />;
}
