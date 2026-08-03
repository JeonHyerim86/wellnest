"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Card, SectionHeader } from "@/components/ui/card";
import { CheckCircle } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleRoutineForToday } from "@/features/todos/actions";
import { cn } from "@/lib/cn";
import { formatRepeatDays } from "@/lib/date";
import type { Routine } from "@/lib/supabase/types";

export function TodayRoutines({
  routines,
  doneMap,
}: {
  routines: Routine[];
  /** routineId → 오늘 완료 여부 */
  doneMap: Record<string, boolean>;
}) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  function isDone(routine: Routine) {
    return optimistic[routine.id] ?? doneMap[routine.id] ?? false;
  }

  function handleToggle(routine: Routine) {
    const next = !isDone(routine);
    setOptimistic((prev) => ({ ...prev, [routine.id]: next }));
    setBusy((prev) => ({ ...prev, [routine.id]: true }));

    startTransition(async () => {
      const result = await toggleRoutineForToday(routine.id, next);
      setBusy((prev) => ({ ...prev, [routine.id]: false }));

      if (!result.ok) {
        setOptimistic((prev) => {
          const copy = { ...prev };
          delete copy[routine.id];
          return copy;
        });
        toast.error(result.message);
      }
    });
  }

  return (
    <section>
      <SectionHeader
        title="오늘의 루틴"
        action={
          <Link
            href="/routines"
            className="rounded-full px-2 py-1 text-label font-medium text-sage-600 hover:bg-sage-50"
          >
            관리
          </Link>
        }
      />

      {routines.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="오늘 반복할 루틴이 없어요"
          description="작은 것부터 하나 만들어 볼까요?"
          action={
            <Link href="/routines">
              <Button size="sm" variant="secondary">
                루틴 만들기
              </Button>
            </Link>
          }
        />
      ) : (
        <Card className="divide-y divide-cream-200 overflow-hidden">
          {routines.map((routine) => {
            const done = isDone(routine);
            return (
              <div key={routine.id} className="flex items-center gap-1 pr-4">
                <CheckCircle
                  checked={done}
                  disabled={busy[routine.id]}
                  onToggle={() => handleToggle(routine)}
                  label={`${routine.title} ${done ? "완료 해제" : "완료"}`}
                />
                <div className="flex min-w-0 flex-1 items-center gap-2 py-3">
                  {routine.emoji && (
                    <span className="text-lg" aria-hidden>
                      {routine.emoji}
                    </span>
                  )}
                  <div className="min-w-0">
                    {/* .pen CheckItem — 제목 15/700 · 메타 12/600 */}
                    <p
                      className={cn(
                        "truncate text-body",
                        done ? "text-ink-400 line-through" : "text-ink-800",
                      )}
                    >
                      {routine.title}
                    </p>
                    <p className="text-caption text-ink-500">
                      루틴 · {formatRepeatDays(routine.repeat_days)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </section>
  );
}
