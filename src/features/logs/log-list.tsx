"use client";

import { useMemo, useState } from "react";

import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/feedback";
import { LogCard } from "@/features/logs/log-card";
import { formatGroupDate } from "@/lib/date";
import type { LogType, WellnessLog } from "@/lib/supabase/types";

type Filter = "all" | LogType;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "meal", label: "식단" },
  { value: "workout", label: "운동" },
];

export function LogList({ logs }: { logs: WellnessLog[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const groups = useMemo(() => {
    const filtered =
      filter === "all" ? logs : logs.filter((log) => log.log_type === filter);

    // 날짜별로 묶는다 (쿼리에서 이미 최신순으로 정렬되어 옴)
    const map = new Map<string, WellnessLog[]>();
    for (const log of filtered) {
      const existing = map.get(log.logged_on);
      if (existing) existing.push(log);
      else map.set(log.logged_on, [log]);
    }
    return [...map.entries()];
  }, [logs, filter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {FILTERS.map((option) => (
          <Chip
            key={option.value}
            tone={
              option.value === "meal"
                ? "meal"
                : option.value === "workout"
                  ? "workout"
                  : "neutral"
            }
            selected={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          emoji="📔"
          title={
            filter === "all"
              ? "첫 기록을 남겨보세요"
              : `${filter === "meal" ? "식단" : "운동"} 기록이 없어요`
          }
          description="오른쪽 아래 + 버튼으로 추가할 수 있어요"
        />
      ) : (
        groups.map(([date, items]) => (
          <section key={date} className="flex flex-col gap-2">
            <h2 className="px-1 text-label text-ink-600">
              {formatGroupDate(date)}
            </h2>
            {items.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
