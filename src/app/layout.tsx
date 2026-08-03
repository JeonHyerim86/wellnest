import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

/** design/wellnest.pen 의 $font-head / $font-body */
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wellnest — 오늘의 웰니스 투두",
  description:
    "할 일과 루틴을 관리하면서 식단·운동 기록까지 한곳에 남기는 웰니스 투두",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 모바일에서 입력 시 확대되지 않도록 (추후 앱 전환 시 동일한 감각)
  maximumScale: 1,
  themeColor: "#FDFCF8",
};

/** design/wellnest.pen 과 동일한 서체·아이콘 세트 */
const ICON_NAMES = [
  "add",
  "arrow_back_ios_new",
  "autorenew",
  "badge",
  "calendar_month",
  "check",
  "check_circle",
  "chevron_right",
  "close",
  "delete",
  "directions_run",
  "eco",
  "edit",
  "error",
  "event_available",
  "event_repeat",
  "home",
  "image",
  "info",
  "keyboard_arrow_down",
  "local_fire_department",
  "logout",
  "more_horiz",
  "notifications",
  "person",
  "photo_camera",
  "priority_high",
  "remove",
  "restaurant",
  "schedule",
  "trending_up",
].join(",");

const MATERIAL_SYMBOLS_HREF =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0" +
  `&icon_names=${ICON_NAMES}&display=block`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${nunito.variable} h-full antialiased`}>
      {/* Pretendard(한글)와 Material Symbols(아이콘 서브셋)는 next/font 로 다룰 수 없어
          루트 레이아웃에서 link 로 로드한다. Nunito 는 next/font 로 자체 호스팅. */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="stylesheet" href={MATERIAL_SYMBOLS_HREF} />
      </head>
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
