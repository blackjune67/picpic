import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-dvh w-full max-w-[var(--shell-max-width)] flex-col items-center justify-center px-[var(--page-gutter)] text-center"><p className="font-[var(--font-display)] text-4xl font-bold text-[var(--accent-red)]">픽픽</p><h1 className="mt-6 font-[var(--font-display)] text-[28px] font-bold">맛집을 찾을 수 없어요</h1><p className="mt-2 text-sm text-[var(--ink-secondary)]">주소가 바뀌었거나 아직 등록되지 않은 곳입니다.</p><Link className="mt-8 inline-flex min-h-[var(--control-height)] items-center rounded-[var(--radius-control)] bg-[var(--accent-red)] px-5 font-semibold text-[var(--surface-card)]" href="/">목록으로 돌아가기</Link></main>;
}
