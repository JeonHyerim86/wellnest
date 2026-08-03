import { AppBarSkeleton } from "@/components/ui/app-bar";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

/** 루틴 화면 로딩 골격 — design/wellnest.pen 의 "Screen · Routines (Loading)" */
export default function RoutinesLoading() {
  return (
    <SkeletonScreen label="루틴을 불러오는 중">
      <AppBarSkeleton titleWidth="w-16" />

      <main className="app-shell flex flex-col gap-3 px-4 pt-4">
        {/* 안내 문구 */}
        <div className="flex flex-col gap-2 px-1">
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-2.5 w-46 rounded-full" />
        </div>

        {/* 오늘 예정 배너 */}
        <Skeleton className="h-12 w-full rounded-tile" />

        <div className="flex flex-col gap-2">
          {["w-34", "w-30", "w-26", "w-32"].map((width, i) => (
            <Card key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="size-11 rounded-field" />

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className={`h-3.5 rounded-full ${width}`} />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-9 rounded-full" />
                  <Skeleton className="h-2.5 w-16 rounded-full" />
                </div>
              </div>

              <Skeleton className="h-6 w-11 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </Card>
          ))}
        </div>
      </main>
    </SkeletonScreen>
  );
}
