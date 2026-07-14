export default function Loading() {
  return <main className="mx-auto min-h-dvh w-full max-w-[var(--shell-max-width)] px-[var(--page-gutter)] py-8" aria-busy="true"><div className="h-9 w-24 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" /><div className="mt-8 h-12 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" /><div className="mt-8 space-y-5">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-muted)]" />)}</div></main>;
}
