import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";
import { LogCardSkeleton } from "@/features/logs/log-card-skeleton";

/**
 * 오늘 화면 로딩 골격 — design/wellnest.pen 의 "Screen · Today (Loading)".
 * 여백은 page.tsx 와 동일하게 맞춰 데이터 도착 시 레이아웃이 튀지 않게 한다.
 */
export default function TodayLoading() {
  return (
    <SkeletonScreen label="오늘 정보를 불러오는 중">
      <main className="app-shell flex flex-col gap-6 px-5 pb-2 pt-3">
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-5 w-40 rounded-full" />
          </div>
          <Skeleton className="size-11 rounded-full" />
        </header>

        {/* 달성률 카드 */}
        <section className="rounded-card bg-skeleton p-[18px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20 rounded-full bg-skeleton-strong" />
              <Skeleton className="h-2.5 w-32 rounded-full bg-skeleton-strong" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full bg-skeleton-strong" />
          </div>

          <Skeleton className="mt-4 h-2.5 w-full rounded-full bg-skeleton-strong" />

          <div className="mt-4 flex gap-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-12 flex-1 rounded-xl bg-skeleton-strong"
              />
            ))}
          </div>
        </section>

        <CheckSection titleWidth="w-24" rows={["w-33", "w-28"]} />
        <CheckSection titleWidth="w-22" rows={["w-30", "w-24"]} />

        <section>
          <SectionHeadSkeleton titleWidth="w-20" />
          <LogCardSkeleton />
        </section>
      </main>
    </SkeletonScreen>
  );
}

/** SectionHeader 와 같은 여백(px-1 pb-2.5)의 제목 골격 */
function SectionHeadSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="flex items-center justify-between px-1 pb-2.5">
      <Skeleton className={`h-4 rounded-full ${titleWidth}`} />
      <Skeleton className="h-3 w-12 rounded-full" />
    </div>
  );
}

/** 루틴 · 할 일 목록의 CheckItem 골격 */
function CheckSection({
  titleWidth,
  rows,
}: {
  titleWidth: string;
  rows: string[];
}) {
  return (
    <section>
      <SectionHeadSkeleton titleWidth={titleWidth} />
      <div className="flex flex-col gap-2">
        {rows.map((width, i) => (
          <Card key={i} className="flex items-center gap-3 p-3.5">
            <Skeleton className="size-9.5 rounded-xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className={`h-3.5 rounded-full ${width}`} />
              <Skeleton className="h-2.5 w-20 rounded-full" />
            </div>
            <Skeleton className="size-6.5 rounded-full" />
          </Card>
        ))}
      </div>
    </section>
  );
}
