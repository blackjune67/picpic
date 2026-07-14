"use client";

export default function Error({ reset }: { readonly reset: () => void }) {
  return <main className="mx-auto flex min-h-dvh w-full max-w-[var(--shell-max-width)] flex-col items-center justify-center px-[var(--page-gutter)] text-center"><h1 className="font-[var(--font-display)] text-[28px] font-bold">잠시 문제가 생겼어요</h1><p className="mt-2 text-sm text-[var(--ink-secondary)]">잠시 후 다시 시도해 주세요.</p><button className="mt-8 min-h-[var(--control-height)] rounded-[var(--radius-control)] bg-[var(--accent-red)] px-5 font-semibold text-[var(--surface-card)]" onClick={reset}>다시 시도</button></main>;
}
