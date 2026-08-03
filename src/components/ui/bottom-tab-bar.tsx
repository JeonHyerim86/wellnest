"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "오늘", icon: "home" },
  { href: "/routines", label: "루틴", icon: "event_repeat" },
  { href: "/logs", label: "기록", icon: "restaurant" },
  { href: "/profile", label: "프로필", icon: "person" },
];

/**
 * 하단 탭바 — design/wellnest.pen 의 TabBar 컴포넌트와 동일한
 * "떠 있는 알약(pill)" 형태. 배경 위에 반투명 흰 바가 얹힌다.
 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 safe-bottom">
      <div className="app-shell px-4 pb-5 pt-2">
        <div className="flex h-15 items-center gap-1 rounded-full bg-white/70 p-1.5 shadow-tab backdrop-blur">
          {TABS.map(({ href, label, icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-1 flex-col items-center justify-center gap-[3px] rounded-full transition-colors",
                  active ? "bg-sage-100 text-sage-600" : "text-ink-400",
                )}
              >
                <Icon name={icon} size={22} weight={active ? 600 : 400} filled={active} />
                <span
                  className={cn(
                    "text-overline",
                    active ? "font-extrabold" : "font-semibold",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
