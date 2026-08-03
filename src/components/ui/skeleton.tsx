import { cn } from "@/lib/cn";

/**
 * 로딩 골격 블록 — design/wellnest.pen 의 C/Skeleton.
 *
 * 스피너 대신 실제 레이아웃과 같은 모양의 회색 블록을 먼저 그린다.
 * 데이터가 도착했을 때 요소들이 제자리에 나타나므로 화면이 튀지 않는다.
 *
 * 크기와 모서리는 className 으로 지정한다 (.pen 변형: Line / Title / Circle / Tile / Block).
 *   <Skeleton className="h-3 w-24 rounded-full" />   // Line
 *   <Skeleton className="size-11 rounded-full" />    // Circle
 *   <Skeleton className="h-16 w-full rounded-card" />// Block
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-skeleton shrink-0 bg-skeleton", className)}
    />
  );
}

/**
 * 로딩 화면 전체를 감싸는 래퍼.
 * 스크린리더에는 "불러오는 중"이라고만 알리고, 골격 블록 자체는 읽지 않는다.
 */
export function SkeletonScreen({
  children,
  label = "불러오는 중",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  );
}
