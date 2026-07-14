"use client";

import Image from "next/image";
import { useState } from "react";

import type { Catalog, CatalogChannel, CatalogRegion } from "@/lib/catalog";

function Chevron() {
  return <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SearchIcon() {
  return <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>;
}

function ChannelSheet({ channels, selected, onClose, onApply }: { readonly channels: readonly CatalogChannel[]; readonly selected: string | undefined; readonly onClose: () => void; readonly onApply: (slug: string | undefined) => void }) {
  const [draft, setDraft] = useState(selected);
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-[rgb(39_37_34_/_42%)]" role="presentation" onMouseDown={onClose}>
      <section aria-labelledby="channel-sheet-title" aria-modal="true" className="w-full max-w-[var(--shell-max-width)] rounded-t-[24px] bg-[var(--surface-card)] px-5 pb-8 pt-4 shadow-[var(--shadow-sheet)]" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mx-auto h-1 w-12 rounded-full bg-[var(--line-strong)]" />
        <h2 id="channel-sheet-title" className="mt-6 font-[var(--font-display)] text-[28px] font-bold">채널 선택</h2>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">보고 싶은 유튜브 채널을 골라보세요</p>
        <div className="mt-5 divide-y divide-[var(--line-default)] border-y border-[var(--line-default)]">
          <button className="flex min-h-[var(--control-height)] w-full items-center justify-between text-left" aria-pressed={draft === undefined} onClick={() => setDraft(undefined)}><span>전체 채널</span><span className={draft === undefined ? "font-semibold text-[var(--accent-red)]" : "text-[var(--ink-tertiary)]"}>{draft === undefined ? "선택됨" : ""}</span></button>
          {channels.map((channel) => <button key={channel.slug} className="flex min-h-[var(--control-height)] w-full items-center justify-between text-left" aria-pressed={draft === channel.slug} onClick={() => setDraft(channel.slug)}><span>{channel.name}</span><span className={draft === channel.slug ? "font-semibold text-[var(--accent-red)]" : "text-[var(--ink-tertiary)]"}>{draft === channel.slug ? "선택됨" : ""}</span></button>)}
        </div>
        <button className="mt-6 min-h-[var(--control-height)] w-full rounded-[var(--radius-control)] bg-[var(--accent-red)] px-4 font-semibold text-[var(--surface-card)] transition-[background-color,transform] duration-150 hover:bg-[var(--accent-red-dark)] active:scale-[0.96]" onClick={() => { onApply(draft); onClose(); }}>적용하기</button>
      </section>
    </div>
  );
}

export function DiscoveryClient({ catalog }: { readonly catalog: Catalog }) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const filteredRestaurants = catalog.restaurants.filter((restaurant) => {
    const normalizedQuery = query.normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
    const queryMatches = normalizedQuery.length === 0 || `${restaurant.name} ${restaurant.district} ${restaurant.address}`.normalize("NFKC").toLocaleLowerCase("ko-KR").includes(normalizedQuery);
    const regionMatches = region === undefined || restaurant.regionSlug === region;
    const channelMatches = channel === undefined || restaurant.appearances.some((appearance) => appearance.channelSlug === channel);
    return queryMatches && regionMatches && channelMatches;
  });
  return (
    <main id="main-content" className="mx-auto min-h-dvh w-full max-w-[var(--shell-max-width)] overflow-x-hidden px-[var(--page-gutter)] pb-8 pt-7">
      <a className="sr-only focus:not-sr-only" href="#main-content">본문으로 건너뛰기</a>
      <header className="flex items-start justify-between">
        <div><p className="font-[var(--font-display)] text-4xl font-bold leading-none text-[var(--accent-red)]">픽픽</p><p className="mt-2 text-sm text-[var(--ink-secondary)]">영상 속 진짜 맛집</p></div>
        <button aria-label="채널 선택 열기" className="flex size-12 items-center justify-center rounded-[var(--radius-control)] hover:bg-[var(--surface-muted)] active:scale-[0.96]" onClick={() => setSheetOpen(true)}><svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg></button>
      </header>
      <section aria-label="맛집 필터" className="mt-7 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="채널 빠른 필터">
          <button aria-pressed={channel === undefined} className={`min-h-11 shrink-0 rounded-[var(--radius-control)] border px-4 text-sm font-semibold ${channel === undefined ? "border-[var(--accent-red)] bg-[var(--accent-red)] text-[var(--surface-card)]" : "border-[var(--line-default)] bg-[var(--surface-card)]"}`} onClick={() => setChannel(undefined)}>전체</button>
          {catalog.channels.map((item) => <button key={item.slug} aria-pressed={channel === item.slug} className={`min-h-11 shrink-0 rounded-[var(--radius-control)] border px-4 text-sm font-semibold ${channel === item.slug ? "border-[var(--accent-red)] bg-[var(--accent-red)] text-[var(--surface-card)]" : "border-[var(--line-default)] bg-[var(--surface-card)]"}`} onClick={() => setChannel(item.slug)}>{item.name}</button>)}
        </div>
        <label className="flex min-h-[var(--control-height)] items-center gap-3 rounded-[var(--radius-control)] border border-[var(--line-default)] bg-[var(--surface-card)] px-4 text-[var(--ink-secondary)]"><SearchIcon /><span className="sr-only">식당이나 동네 검색</span><input className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-tertiary)]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="식당이나 동네를 검색하세요" /></label>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="지역 필터">
          <button aria-pressed={region === undefined} className={`min-h-11 shrink-0 rounded-[var(--radius-control)] border px-4 text-sm font-semibold ${region === undefined ? "border-[var(--accent-red)] bg-[var(--accent-red)] text-[var(--surface-card)]" : "border-[var(--line-default)] bg-[var(--surface-card)]"}`} onClick={() => setRegion(undefined)}>전체 지역</button>
          {catalog.regions.map((item: CatalogRegion) => <button key={item.slug} aria-pressed={region === item.slug} className={`min-h-11 shrink-0 rounded-[var(--radius-control)] border px-4 text-sm font-semibold ${region === item.slug ? "border-[var(--accent-red)] bg-[var(--accent-red)] text-[var(--surface-card)]" : "border-[var(--line-default)] bg-[var(--surface-card)]"}`} onClick={() => setRegion(item.slug)}>{item.name}</button>)}
        </div>
      </section>
      <div className="mt-7 flex items-center justify-between border-b border-[var(--line-default)] pb-3"><p className="text-sm text-[var(--ink-secondary)]"><span className="font-semibold text-[var(--ink-primary)]">{filteredRestaurants.length}</span>곳을 찾았어요</p><button className="min-h-11 rounded-[var(--radius-control)] px-3 text-sm font-semibold text-[var(--ink-secondary)] hover:bg-[var(--surface-muted)]" onClick={() => setSheetOpen(true)}>채널 더보기</button></div>
      {filteredRestaurants.length === 0 ? <section className="py-16 text-center"><h2 className="font-[var(--font-display)] text-[22px] font-bold">조건에 맞는 맛집이 없어요</h2><p className="mt-2 text-sm text-[var(--ink-secondary)]">검색어나 필터를 조금만 바꿔보세요.</p></section> : <section aria-label="맛집 목록" className="divide-y divide-[var(--line-default)]">{filteredRestaurants.map((restaurant) => <a key={restaurant.slug} href={`/restaurants/${restaurant.slug}`} className="flex gap-4 py-5 transition-[background-color] duration-150 hover:bg-[var(--surface-muted)]"><div className="relative size-28 shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface-muted)] outline outline-1 outline-[rgb(39_37_34_/_10%)]"><Image src={restaurant.imagePath} alt="" fill sizes="112px" className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="font-[var(--font-display)] text-[22px] font-bold leading-tight">{restaurant.name}</h2><Chevron /></div><p className="mt-1 text-sm text-[var(--ink-secondary)]">{restaurant.district} · {restaurant.address.split(" ").slice(-1)[0]}</p><p className="mt-2 text-sm leading-6 text-[var(--ink-secondary)] [text-wrap:pretty]">{restaurant.editorialNote}</p><div className="mt-2 flex flex-wrap gap-2">{restaurant.appearances.slice(0, 2).map((appearance) => <span key={appearance.id} className="inline-flex min-h-7 items-center rounded-[var(--radius-control)] border border-[var(--line-default)] bg-[var(--surface-card)] px-2 text-xs font-semibold text-[var(--ink-secondary)]">{appearance.channelName} EP</span>)}</div></div></a>)}</section>}
      {sheetOpen ? <ChannelSheet channels={catalog.channels} selected={channel} onClose={() => setSheetOpen(false)} onApply={setChannel} /> : null}
    </main>
  );
}
