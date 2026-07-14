import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: { default: "픽픽 | 영상 속 진짜 맛집", template: "%s | 픽픽" }, description: "영상에서 발견한 진짜 맛집을 다시 찾아보세요.", openGraph: { title: "픽픽 | 영상 속 진짜 맛집", description: "영상에서 발견한 진짜 맛집을 다시 찾아보세요.", type: "website" }, twitter: { card: "summary", title: "픽픽 | 영상 속 진짜 맛집", description: "영상에서 발견한 진짜 맛집을 다시 찾아보세요." } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko" className="h-full antialiased"><body className="flex min-h-full flex-col">{children}</body></html>; }
