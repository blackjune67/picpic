import { DiscoveryClient } from "./discovery-client";
import { fixtureCatalogRepository } from "@/lib/catalog";

export default async function Home() {
  const catalog = await fixtureCatalogRepository.list();
  return <DiscoveryClient catalog={catalog} />;
}
