import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

export function AppBar({
  title,
  subtitle,
  leading,
  trailing,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 bg-cream-50/90 backdrop-blur">
      <div className="app-shell flex h-14 items-center gap-2 px-4">
        {leading}
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p className="truncate text-overline uppercase text-sage-600">
              {subtitle}
            </p>
          )}
          <h1 className="truncate text-subtitle text-ink-800">{title}</h1>
        </div>
        {trailing}
      </div>
    </header>
  );
}

/**
 * AppBar 의 로딩 골격. 높이(h-14)와 여백을 실제 AppBar 와 똑같이 맞춰
 * 데이터가 도착해도 아래 내용이 밀리지 않게 한다.
 */
export function AppBarSkeleton({
  titleWidth,
  trailing = false,
}: {
  titleWidth: string;
  trailing?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 bg-cream-50/90 backdrop-blur">
      <div className="app-shell flex h-14 items-center gap-2 px-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-12 rounded-full" />
          <Skeleton className={`h-4.5 rounded-full ${titleWidth}`} />
        </div>
        {trailing && <Skeleton className="h-7.5 w-26 rounded-full" />}
      </div>
    </header>
  );
}

/** .pen AppBar 의 원형 뒤로가기 버튼 */
export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="뒤로 가기"
      className="grid size-[38px] shrink-0 place-items-center rounded-full bg-white text-ink-800 transition-colors hover:bg-cream-100"
    >
      <Icon name="arrow_back_ios_new" size={18} />
    </Link>
  );
}
