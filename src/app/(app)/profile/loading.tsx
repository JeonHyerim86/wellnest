import { AppBarSkeleton } from "@/components/ui/app-bar";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

/** 프로필 화면 로딩 골격 — design/wellnest.pen 의 "Screen · Profile (Loading)" */
export default function ProfileLoading() {
  return (
    <SkeletonScreen label="프로필을 불러오는 중">
      <AppBarSkeleton titleWidth="w-16" />

      <main className="app-shell flex flex-col gap-4 px-4 pt-4">
        {/* 프로필 사진 · 이름 · 가입일 배지 */}
        <div className="flex flex-col items-center gap-3 py-2">
          <Skeleton className="size-22 rounded-full" />

          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7.5 w-22 rounded-full" />
            <Skeleton className="h-7.5 w-25 rounded-full" />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-5 w-30 rounded-full" />
            <Skeleton className="h-3 w-38 rounded-full" />
          </div>

          <Skeleton className="h-7 w-34 rounded-full" />
        </div>

        {/* 닉네임 · 앱 정보 */}
        <Card className="rounded-card px-[18px] py-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-3.5 ${i > 0 ? "border-t border-cream-200" : ""}`}
            >
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3.5 w-16 flex-1 rounded-full" />
              <Skeleton className="h-3 w-14 rounded-full" />
              <Skeleton className="size-4 rounded-full" />
            </div>
          ))}
        </Card>

        {/* 로그아웃 */}
        <Skeleton className="h-13 w-full rounded-field" />

        {/* 활성 루틴 · 완료한 할 일 · 남긴 기록 */}
        <Card className="grid grid-cols-3 divide-x divide-cream-200 p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-6 w-8 rounded-full" />
              <Skeleton className="h-3 w-14 rounded-full" />
            </div>
          ))}
        </Card>
      </main>
    </SkeletonScreen>
  );
}
