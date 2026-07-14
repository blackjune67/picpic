import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-dvh w-full max-w-[var(--shell-max-width)] flex-col items-center justify-center px-[var(--page-gutter)] text-center"><p className="font-[var(--font-display)] text-4xl font-black text-[var(--accent-red)]">픽픽</p><p className="mt-10 text-[11px] font-bold uppercase text-[var(--accent-red)]">NOT FOUND</p><h1 className="mt-3 font-[var(--font-display)] text-[28px] font-bold text-balance">맛집을 찾을 수 없어요</h1><p className="mt-2 max-w-[28ch] text-sm leading-6 text-[var(--ink-secondary)] text-pretty">주소가 바뀌었거나 아직 등록되지 않은 곳입니다.</p><Link className="mt-8 inline-flex min-h-[var(--control-height)] items-center rounded-[var(--radius-control)] bg-[var(--accent-red)] px-5 font-bold text-[var(--surface-card)] hover:bg-[var(--accent-red-dark)]" href="/">목록으로 돌아가기</Link></main>;
}
