import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LogCard 의 로딩 골격 — 오늘 화면과 기록 화면이 함께 쓴다.
 * 여백·크기는 log-card.tsx 와 동일하게 맞춰서 데이터가 도착해도 레이아웃이 튀지 않는다.
 *
 * titleWidth 는 카드마다 제목 길이를 달리 보여주기 위한 것이다.
 * 모두 같은 길이면 골격이 기계적으로 보인다.
 */
export function LogCardSkeleton({
  titleWidth = "w-38",
}: {
  titleWidth?: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-2.5">
      <Skeleton className="size-16 rounded-xl" />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-[70px] rounded-full" />
          <Skeleton className="h-2.5 w-8 rounded-full" />
        </div>
        <Skeleton className={`h-3.5 rounded-full ${titleWidth}`} />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>

      <Skeleton className="size-5 rounded-full" />
    </Card>
  );
}
