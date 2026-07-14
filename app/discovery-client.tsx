"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Catalog, CatalogChannel, CatalogRestaurant } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type IconName = "arrow" | "menu" | "search" | "close" | "check";

function Icon({ name }: { readonly name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    search: <><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4 4" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4.5 4.5L19 7" />,
  };
  return <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function ChannelSheet({ channels, selected, counts, onClose, onApply }: { readonly channels: readonly CatalogChannel[]; readonly selected: string | undefined; readonly counts: Readonly<Record<string, number>>; readonly onClose: () => void; readonly onApply: (slug: string | undefined) => void }) {
  const [draft, setDraft] = useState(selected);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeButtonRef.current?.focus(); const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { onClose(); document.querySelector<HTMLButtonElement>('button[aria-label="채널 선택 열기"]')?.focus(); return; } if (event.key !== "Tab") return; const dialog = closeButtonRef.current?.closest("[role=dialog]"); const focusable = dialog?.querySelectorAll<HTMLElement>("button, input, [href]"); if (!focusable?.length) return; const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [onClose]);
  const options = [{ slug: undefined, name: "전체 채널", count: Object.values(counts).reduce((total, count) => total + count, 0) }, ...channels.map((channel) => ({ slug: channel.slug, name: channel.name, count: counts[channel.slug] ?? 0 }))];
  return <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}><section aria-labelledby="channel-sheet-title" aria-modal="true" className="channel-sheet" role="dialog" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="sheet-head"><div><p className="eyebrow">SOURCE FILTER</p><h2 id="channel-sheet-title">채널을 골라보세요</h2><p>어떤 영상에서 발견했는지 기준을 정해요.</p></div><button ref={closeButtonRef} aria-label="채널 선택 닫기" className="icon-button soft" onClick={onClose}><Icon name="close" /></button></div><div className="channel-options">{options.map((option) => { const active = draft === option.slug; return <button key={option.slug ?? "all"} aria-pressed={active} className={cn("channel-option", active && "is-active")} onClick={() => setDraft(option.slug)}><span className="check-box"><Icon name="check" /></span><span>{option.name}</span><small>{option.count}곳</small></button>; })}</div><button className="button button-primary sheet-apply" onClick={() => { onApply(draft); onClose(); }}>이 기준으로 보기</button></section></div>;
}

function Preview({ restaurant }: { readonly restaurant: CatalogRestaurant }) {
  return <aside className="preview-card"><div className="preview-image"><Image src={restaurant.imagePath} alt={`${restaurant.name} 대표 음식`} fill sizes="(min-width: 960px) 46vw, 100vw" className="object-cover" /><span>FRAME / {restaurant.appearances.length}</span></div><div className="preview-copy"><p className="eyebrow">{restaurant.district} · 기록된 맛</p><h3>{restaurant.name}</h3><p className="muted">{restaurant.editorialNote}</p><div className="preview-footer"><span>{restaurant.appearances.length}개 영상에서 확인</span><Link className="text-link" href={`/restaurants/${restaurant.slug}`}>자세히 <Icon name="arrow" /></Link></div></div></aside>;
}

function RestaurantRow({ restaurant, selected, onSelect }: { readonly restaurant: CatalogRestaurant; readonly selected: boolean; readonly onSelect: () => void }) {
  return <article className={cn("restaurant-row", selected && "is-selected")}><button aria-label={`${restaurant.name} 선택`} aria-pressed={selected} onClick={onSelect}><div className="row-image"><Image src={restaurant.imagePath} alt={`${restaurant.name} 대표 음식`} fill sizes="112px" className="object-cover" /><span>{restaurant.district}</span></div><div className="row-copy"><div className="row-title"><h2>{restaurant.name}</h2><Icon name="arrow" /></div><p>{restaurant.editorialNote}</p><div className="source-chips">{restaurant.appearances.slice(0, 2).map((appearance) => <span key={appearance.id}>{appearance.channelName} · EP</span>)}</div></div></button><Link aria-label={`${restaurant.name} 상세 페이지`} href={`/restaurants/${restaurant.slug}`} className="row-detail">보기</Link></article>;
}

export function DiscoveryClient({ catalog }: { readonly catalog: Catalog }) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(catalog.restaurants[0]?.slug);
  const counts = Object.fromEntries(catalog.channels.map((item) => [item.slug, catalog.restaurants.filter((restaurant) => restaurant.appearances.some((appearance) => appearance.channelSlug === item.slug)).length]));
  const normalizedQuery = query.normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
  const filteredRestaurants = catalog.restaurants.filter((restaurant) => { const searchable = `${restaurant.name} ${restaurant.district} ${restaurant.address}`.normalize("NFKC").toLocaleLowerCase("ko-KR"); return (normalizedQuery.length === 0 || searchable.includes(normalizedQuery)) && (region === undefined || restaurant.regionSlug === region) && (channel === undefined || restaurant.appearances.some((appearance) => appearance.channelSlug === channel)); });
  const selectedRestaurant = filteredRestaurants.find((restaurant) => restaurant.slug === selectedSlug) ?? filteredRestaurants[0];
  const resetFilters = () => { setQuery(""); setChannel(undefined); setRegion(undefined); };
  return <main id="main-content" className="discovery-shell"><a className="skip-link" href="#main-content">본문으로 건너뛰기</a><header className="site-header"><Link href="/" className="wordmark">픽픽<span>.</span></Link><p className="header-note">영상 속 맛의 단서<br /><strong>한 장면씩 기록해요.</strong></p><button aria-label="채널 선택 열기" className="icon-button" onClick={() => setSheetOpen(true)}><Icon name="menu" /></button></header><section className="discovery-hero"><div><p className="eyebrow">FOOD, RE-FRAMED</p><h1><span className="hero-line">다시 가고 싶은</span><span className="hero-line"><em>그 집</em>을 찾아요.</span></h1><p className="hero-copy">영상 속에서 스쳐간 맛집을 지역과 채널로 모았어요. 왜 기억에 남았는지 함께 기록해요.</p></div><div className="hero-stamp"><strong>{catalog.restaurants.length}</strong><span>PLACES<br />ON RECORD</span></div></section><section className="filter-panel" aria-label="맛집 필터"><div className="filter-top"><div className="filter-tabs" aria-label="채널 빠른 필터"><button aria-pressed={channel === undefined} className={cn(channel === undefined && "is-active")} onClick={() => setChannel(undefined)}>전체</button>{catalog.channels.map((item) => <button key={item.slug} aria-pressed={channel === item.slug} className={cn(channel === item.slug && "is-active")} onClick={() => setChannel(item.slug)}>{item.name}</button>)}</div><label className="search-field"><Icon name="search" /><input aria-label="식당이나 동네 검색" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="식당이나 동네 검색" /></label></div><div className="region-tabs" aria-label="지역 필터"><button aria-pressed={region === undefined} className={cn(region === undefined && "is-active")} onClick={() => setRegion(undefined)}>모든 지역</button>{catalog.regions.map((item) => <button key={item.slug} aria-pressed={region === item.slug} className={cn(region === item.slug && "is-active")} onClick={() => setRegion(item.slug)}>{item.name}</button>)}</div></section><div className="results-heading"><div><p className="eyebrow">THE SHORTLIST</p><p><strong>{filteredRestaurants.length}</strong>곳의 기록</p></div><button className="filter-more" onClick={() => setSheetOpen(true)}>채널 필터 <Icon name="arrow" /></button></div>{filteredRestaurants.length === 0 ? <section className="empty-state"><Icon name="search" /><h2>조건에 맞는 맛집이 없어요</h2><p>검색어나 필터를 조금만 바꾸면 다른 발견이 나올 수 있어요.</p><button className="button button-primary" onClick={resetFilters}>필터 초기화</button></section> : <div className="results-grid"><section className="restaurant-list" aria-label="맛집 목록">{filteredRestaurants.map((restaurant) => <RestaurantRow key={restaurant.slug} restaurant={restaurant} selected={selectedRestaurant?.slug === restaurant.slug} onSelect={() => setSelectedSlug(restaurant.slug)} />)}</section>{selectedRestaurant ? <Preview restaurant={selectedRestaurant} /> : null}</div>}{sheetOpen ? <ChannelSheet channels={catalog.channels} selected={channel} counts={counts} onClose={() => setSheetOpen(false)} onApply={setChannel} /> : null}</main>;
}
