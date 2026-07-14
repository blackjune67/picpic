"use client";

export default function Error({ reset }: { readonly reset: () => void }) {
  return <main className="mx-auto flex min-h-dvh w-full max-w-[var(--shell-max-width)] flex-col items-center justify-center px-[var(--page-gutter)] text-center"><p className="text-[11px] font-bold uppercase text-[var(--accent-red)]">TEMPORARY ERROR</p><h1 className="mt-3 font-[var(--font-display)] text-[28px] font-bold text-balance">잠시 문제가 생겼어요</h1><p className="mt-2 text-sm text-[var(--ink-secondary)]">잠시 후 다시 시도해 주세요.</p><button className="mt-8 min-h-[var(--control-height)] rounded-[var(--radius-control)] bg-[var(--accent-red)] px-5 font-bold text-[var(--surface-card)] hover:bg-[var(--accent-red-dark)]" onClick={reset}>다시 시도</button></main>;
}
