import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { MealType, WellnessLog } from "@/lib/supabase/types";

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

/**
 * 기록 한 건을 보여주는 카드 — design/wellnest.pen 의 C/LogCard 와 동일 구조.
 * 썸네일(왼쪽) · 배지+시각 · 제목 · 부가정보 · 진입 화살표
 */
export function LogCard({ log }: { log: WellnessLog }) {
  const isMeal = log.log_type === "meal";

  const badgeLabel = isMeal
    ? log.meal_type
      ? `식단 · ${MEAL_TYPE_LABEL[log.meal_type]}`
      : "식단"
    : "운동";

  const detail = isMeal
    ? log.calories !== null
      ? `${log.calories.toLocaleString()} kcal`
      : "칼로리 미입력"
    : log.duration_min !== null
      ? `${log.duration_min}분`
      : "시간 미입력";

  const time = new Date(log.created_at).toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <Link href={`/logs/${log.id}`} className="block">
      <Card className="flex items-center gap-3 p-2.5">
        {log.image_url ? (
          // Storage 도메인이 바뀔 수 있어 next/image 대신 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={log.image_url}
            alt=""
            className="size-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span
            className={cn(
              "grid size-16 shrink-0 place-items-center rounded-xl text-2xl",
              isMeal ? "bg-meal-bg" : "bg-workout-bg",
            )}
            aria-hidden
          >
            {isMeal ? "🍽" : "🏃"}
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-[3px] text-overline",
                isMeal ? "bg-meal-bg text-meal" : "bg-workout-bg text-workout",
              )}
            >
              {badgeLabel}
            </span>
            <span className="text-micro text-ink-400">{time}</span>
          </div>
          <p className="truncate text-label font-bold text-ink-800">
            {log.title}
          </p>
          <p className="truncate text-caption text-ink-500">{detail}</p>
        </div>

        <Icon name="chevron_right" size={20} className="text-ink-400" />
      </Card>
    </Link>
  );
}
