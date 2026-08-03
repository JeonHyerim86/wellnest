import { AppBarSkeleton } from "@/components/ui/app-bar";
import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";
import { LogCardSkeleton } from "@/features/logs/log-card-skeleton";

/** 기록 화면 로딩 골격 — design/wellnest.pen 의 "Screen · Logs (Loading)" */
export default function LogsLoading() {
  return (
    <SkeletonScreen label="기록을 불러오는 중">
      <AppBarSkeleton titleWidth="w-13" trailing />

      <main className="app-shell flex flex-col gap-4 px-4 pt-4">
        {/* 전체 · 식단 · 운동 필터 칩 */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8.5 w-14 rounded-full" />
          ))}
        </div>

        {[
          ["w-38", "w-32"],
          ["w-35"],
        ].map((widths, group) => (
          <section key={group} className="flex flex-col gap-2">
            <Skeleton className="ml-1 h-3.5 w-22 rounded-full" />
            {widths.map((width, i) => (
              <LogCardSkeleton key={i} titleWidth={width} />
            ))}
          </section>
        ))}
      </main>
    </SkeletonScreen>
  );
}
