"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { CatalogRestaurant } from "@/lib/catalog";
import { createNaverMapTapAction } from "@/lib/naver/action";

function ExternalLinkIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 5h5v5M19 5l-8 8" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" strokeLinecap="round" /></svg>;
}

export function RestaurantDetailClient({ restaurant }: { readonly restaurant: CatalogRestaurant }) {
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const openMap = async () => {
    const action = createNaverMapTapAction({ name: restaurant.name, address: restaurant.address, appName: "https://picpic.local", latitude: restaurant.latitude, longitude: restaurant.longitude }, { onNavigationBlocked: () => setFallback(true) });
    const result = await action();
    if (result.kind === "fallback") setFallback(true);
  };
  const copyAddress = async () => {
    const copiedAddress = await navigator.clipboard?.writeText(restaurant.address).then(() => true, () => false) ?? false;
    setCopied(copiedAddress);
  };
  return <main id="main-content" className="mx-auto min-h-dvh w-full max-w-[var(--shell-max-width)] overflow-x-hidden bg-[var(--surface-paper)] px-[var(--page-gutter)] pb-32 pt-4"><header className="flex min-h-12 items-center justify-between"><Link aria-label="맛집 목록으로 돌아가기" className="flex size-12 items-center justify-center rounded-[var(--radius-control)] hover:bg-[var(--surface-muted)]" href="/"><svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg></Link><span className="text-sm text-[var(--ink-tertiary)]">상세 보기</span><span className="size-12" aria-hidden="true" /></header><div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface-muted)] outline outline-1 outline-[rgb(39_37_34_/_10%)]"><Image src={restaurant.imagePath} alt={`${restaurant.name} 대표 음식`} fill priority sizes="(max-width: 560px) 100vw, 560px" className="object-cover" /></div><section className="mt-6"><h1 className="font-[var(--font-display)] text-[32px] font-bold leading-tight">{restaurant.name}</h1><p className="mt-2 text-sm text-[var(--ink-secondary)]">위치 · {restaurant.district} · {restaurant.address.split(" ").slice(-1)[0]}</p><button className="mt-5 flex min-h-12 w-full items-center justify-between border-y border-[var(--line-default)] py-3 text-left text-sm" onClick={() => void openMap()}><span>{restaurant.address}</span><span aria-hidden="true">›</span></button><p className="mt-5 rounded-[var(--radius-control)] bg-[var(--surface-muted)] px-4 py-4 text-[15px] leading-7 text-[var(--ink-primary)]">{restaurant.editorialNote}</p></section><section aria-labelledby="appearance-heading" className="mt-8"><h2 id="appearance-heading" className="font-[var(--font-display)] text-[22px] font-bold">영상에서 이렇게 소개됐어요</h2><div className="mt-3 divide-y divide-[var(--line-default)] border-y border-[var(--line-default)]">{restaurant.appearances.map((appearance) => <a key={appearance.id} className="flex min-h-16 items-center justify-between gap-3 py-3" href={`https://www.youtube.com/watch?v=${appearance.youtubeVideoId}`} target="_blank" rel="noreferrer"><span><strong className="block text-sm">{appearance.channelName} · {appearance.episodeTitle}</strong><span className="mt-1 block text-xs text-[var(--ink-secondary)]">{new Date(appearance.publishedAt).toLocaleDateString("ko-KR")} · {appearance.verification === "sample_unverified" ? "샘플 검증 전" : "출처 확인"}</span></span><ExternalLinkIcon /></a>)}</div></section><div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[var(--shell-max-width)] bg-[var(--surface-paper)] px-[var(--page-gutter)] pb-5 pt-3"><button className="min-h-[var(--control-height)] w-full rounded-[var(--radius-control)] bg-[var(--accent-red)] px-4 font-semibold text-[var(--surface-card)] transition-[background-color,transform] duration-150 hover:bg-[var(--accent-red-dark)] active:scale-[0.96]" onClick={() => void openMap()}>네이버지도에서 보기</button>{fallback ? <div className="mt-2 flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--line-default)] bg-[var(--surface-card)] px-3 py-2 text-xs"><span>앱을 열 수 없어요. 주소를 복사해 지도에서 찾아보세요.</span><button className="min-h-9 shrink-0 font-semibold text-[var(--accent-red)]" onClick={() => void copyAddress()}>{copied ? "복사됨" : "주소 복사"}</button></div> : null}</div></main>;
}
