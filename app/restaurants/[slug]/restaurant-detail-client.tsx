"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { CatalogRestaurant } from "@/lib/catalog";
import { createNaverMapTapAction } from "@/lib/naver/action";

function Icon({ name }: { readonly name: "arrow" | "back" | "external" | "pin" }) {
  const paths = { back: <path d="m15 5-7 7 7 7" />, pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>, external: <><path d="M14 5h5v5M19 5l-8 8" /><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>, arrow: <path d="M5 12h13m-5-5 5 5-5 5" /> } as const;
  return <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function RestaurantDetailClient({ restaurant }: { readonly restaurant: CatalogRestaurant }) {
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const openMap = async () => { const action = createNaverMapTapAction({ name: restaurant.name, address: restaurant.address, appName: "https://picpic.local", latitude: restaurant.latitude, longitude: restaurant.longitude }, { onNavigationBlocked: () => setFallback(true) }); const result = await action(); if (result.kind === "fallback") setFallback(true); };
  const copyAddress = async () => { const didCopy = await navigator.clipboard?.writeText(restaurant.address).then(() => true, () => false) ?? false; setCopied(didCopy); };
  return <main id="main-content" className="detail-shell"><header className="detail-header"><Link aria-label="맛집 목록으로 돌아가기" className="icon-button" href="/"><Icon name="back" /></Link><Link href="/" className="wordmark small">픽픽<span>.</span></Link><span className="detail-count">{restaurant.appearances.length} SOURCES</span></header><div className="detail-layout"><figure className="detail-hero-image"><Image src={restaurant.imagePath} alt={`${restaurant.name} 대표 음식`} fill priority sizes="(max-width: 760px) 100vw, 55vw" className="object-cover" /><figcaption>FRAME / {restaurant.appearances.length}</figcaption></figure><section className="detail-copy"><p className="eyebrow">{restaurant.district} · ON RECORD</p><h1>{restaurant.name}</h1><p className="detail-location"><Icon name="pin" />{restaurant.address}</p><button className="address-button" onClick={() => void openMap()}><span>지도에서 위치 확인하기</span><Icon name="arrow" /></button><p className="editorial-note">{restaurant.editorialNote}</p><div className="detail-meta"><span>CURATED NOTE</span><span>LOCAL / {restaurant.district}</span></div></section></div><section className="provenance" aria-labelledby="appearance-heading"><div className="section-heading"><div><p className="eyebrow">PROVENANCE</p><h2 id="appearance-heading">영상에서 이렇게 소개됐어요</h2></div><span>{restaurant.appearances.length}편</span></div><div className="source-list">{restaurant.appearances.map((appearance) => <a key={appearance.id} href={`https://www.youtube.com/watch?v=${appearance.youtubeVideoId}`} target="_blank" rel="noreferrer"><span className="source-index">{String(appearance.visitOrder).padStart(2, "0")}</span><span className="source-copy"><strong>{appearance.channelName}</strong><span>{appearance.episodeTitle} · {new Date(appearance.publishedAt).toLocaleDateString("ko-KR")}</span></span><Icon name="external" /></a>)}</div></section><div className="detail-action"><button className="button button-primary" onClick={() => void openMap()}>네이버지도에서 보기 <Icon name="arrow" /></button>{fallback ? <div className="fallback-note"><span>앱을 열 수 없어요. 주소를 복사해 지도에서 찾아보세요.</span><button onClick={() => void copyAddress()}>{copied ? "복사됨" : "주소 복사"}</button></div> : null}</div></main>;
}
