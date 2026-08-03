import Link from "next/link";
import { notFound } from "next/navigation";

import { AppBar, BackButton } from "@/components/ui/app-bar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { MEAL_TYPE_LABEL } from "@/features/logs/log-card";
import { LogDeleteButton } from "@/features/logs/log-delete-button";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { formatFullDate } from "@/lib/date";
import type { WellnessLog } from "@/lib/supabase/types";

export const metadata = { title: "기록 상세 · Wellnest" };

export default async function LogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("logs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // 삭제됐거나 다른 사용자의 기록이면 404 (RLS + 명시적 필터 이중 방어)
  if (!data) notFound();

  const log = data as WellnessLog;
  const isMeal = log.log_type === "meal";

  const time = new Date(log.created_at).toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const metrics = isMeal
    ? [
        {
          icon: "local_fire_department" as const,
          label: "칼로리",
          value:
            log.calories !== null
              ? `${log.calories.toLocaleString()} kcal`
              : "미입력",
        },
        {
          icon: "schedule" as const,
          label: "식사",
          value: log.meal_type ? MEAL_TYPE_LABEL[log.meal_type] : "미지정",
        },
      ]
    : [
        {
          icon: "schedule" as const,
          label: "운동 시간",
          value: log.duration_min !== null ? `${log.duration_min}분` : "미입력",
        },
        {
          icon: "directions_run" as const,
          label: "종류",
          value: "운동",
        },
      ];

  return (
    <>
      <AppBar
        title="기록 상세"
        leading={<BackButton href="/logs" />}
        trailing={<LogDeleteButton id={log.id} title={log.title} />}
      />

      <main className="app-shell flex flex-col gap-4 px-4 pt-1.5">
        {log.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={log.image_url}
            alt={log.title}
            className="h-[220px] w-full rounded-card object-cover"
          />
        ) : (
          <div
            className={cn(
              "grid h-[160px] w-full place-items-center rounded-card text-5xl",
              isMeal ? "bg-meal-bg" : "bg-workout-bg",
            )}
            aria-hidden
          >
            {isMeal ? "🍽" : "🏃"}
          </div>
        )}

        <Card className="flex flex-col gap-3.5 rounded-card p-[18px]">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                isMeal ? "bg-meal-bg text-meal" : "bg-workout-bg text-workout",
              )}
            >
              <Icon
                name={isMeal ? "restaurant" : "directions_run"}
                size={13}
              />
              {isMeal
                ? log.meal_type
                  ? `식단 · ${MEAL_TYPE_LABEL[log.meal_type]}`
                  : "식단"
                : "운동"}
            </span>
            <span className="text-caption text-ink-400">
              {formatFullDate(log.logged_on)} · {time}
            </span>
          </div>

          <h1 className="text-title text-ink-800">{log.title}</h1>

          <div className="flex gap-2.5">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex flex-1 flex-col gap-1 rounded-field bg-cream-100 p-3"
              >
                <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-500">
                  <Icon name={m.icon} size={14} className="text-sage-500" />
                  {m.label}
                </span>
                <span className="text-[17px] font-extrabold text-ink-800">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {log.memo && (
          <Card className="flex flex-col gap-2 rounded-card p-[18px]">
            <h2 className="text-label font-extrabold text-ink-800">메모</h2>
            <p className="whitespace-pre-wrap text-caption leading-relaxed text-ink-500">
              {log.memo}
            </p>
          </Card>
        )}

        <Link
          href={`/logs/${log.id}/edit`}
          className="flex h-13 w-full items-center justify-center gap-1.5 rounded-2xl bg-sage-500 text-body font-extrabold text-white transition-colors hover:bg-sage-600"
        >
          <Icon name="edit" size={18} />
          기록 수정
        </Link>
      </main>
    </>
  );
}
