"use client";

import { useState, useTransition } from "react";

import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Fab } from "@/components/ui/fab";
import { EmptyState } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  deleteRoutine,
  toggleRoutineActive,
} from "@/features/routines/actions";
import {
  RoutineSheet,
  type RoutinePrefill,
} from "@/features/routines/routine-sheet";
import { cn } from "@/lib/cn";
import { formatRepeatDays } from "@/lib/date";
import type { Routine, RoutineCategory } from "@/lib/supabase/types";

const CATEGORY_LABEL: Record<RoutineCategory, string> = {
  health: "건강",
  meal: "식단",
  mind: "마음",
  life: "생활",
};

const SUGGESTIONS = [
  { title: "물 2L 마시기", emoji: "💧", category: "health" as const },
  { title: "아침 스트레칭", emoji: "🧘", category: "health" as const },
  { title: "30분 산책", emoji: "🚶", category: "health" as const },
];

export function RoutineManager({ routines }: { routines: Routine[] }) {
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [prefill, setPrefill] = useState<RoutinePrefill | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeOverride, setActiveOverride] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  function isActive(routine: Routine) {
    return activeOverride[routine.id] ?? routine.is_active;
  }

  function handleToggleActive(routine: Routine) {
    const next = !isActive(routine);
    setActiveOverride((prev) => ({ ...prev, [routine.id]: next }));
    setBusy((prev) => ({ ...prev, [routine.id]: true }));

    startTransition(async () => {
      const result = await toggleRoutineActive(routine.id, next);
      setBusy((prev) => ({ ...prev, [routine.id]: false }));

      if (!result.ok) {
        setActiveOverride((prev) => {
          const copy = { ...prev };
          delete copy[routine.id];
          return copy;
        });
        toast.error(result.message);
      }
    });
  }

  function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);

    startTransition(async () => {
      const result = await deleteRoutine(pendingDelete.id);
      setDeleting(false);
      setPendingDelete(null);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("삭제했어요");
    });
  }

  const titles = routines.map((routine) => routine.title);

  return (
    <>
      {routines.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="아직 루틴이 없어요"
          description="작은 것부터 시작해 볼까요?"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Chip
                  key={suggestion.title}
                  tone="sage"
                  onClick={() => {
                    // 추천 칩은 생성 시트를 열되 입력값만 미리 채워준다.
                    setEditing(null);
                    setPrefill(suggestion);
                    setSheetOpen(true);
                  }}
                >
                  {suggestion.emoji} {suggestion.title}
                </Chip>
              ))}
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {routines.map((routine) => {
            const active = isActive(routine);
            return (
              <Card
                key={routine.id}
                className={cn(
                  "flex items-center gap-3 p-3",
                  !active && "opacity-60",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditing(routine);
                    setPrefill(null);
                    setSheetOpen(true);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-field bg-sage-50 text-lg">
                    {routine.emoji ?? "🌿"}
                  </span>
                  {/* .pen C/RoutineRow — 제목 15/800 · 카테고리 10/700 · 요일 11/600 */}
                  <span className="min-w-0">
                    <span className="block truncate text-body font-extrabold text-ink-800">
                      {routine.title}
                    </span>
                    <span className="mt-[5px] flex items-center gap-1.5">
                      <span className="rounded-full bg-cream-100 px-2 py-[3px] text-overline text-ink-500">
                        {CATEGORY_LABEL[routine.category]}
                      </span>
                      <span className="text-micro text-ink-400">
                        {formatRepeatDays(routine.repeat_days)}
                      </span>
                    </span>
                  </span>
                </button>

                <Switch
                  checked={active}
                  disabled={busy[routine.id]}
                  label={`${routine.title} ${active ? "비활성화" : "활성화"}`}
                  onToggle={() => handleToggleActive(routine)}
                />

                <button
                  type="button"
                  aria-label={`${routine.title} 삭제`}
                  onClick={() => setPendingDelete(routine)}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-danger-bg hover:text-danger"
                >
                  <Icon name="delete" size={18} />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <Fab
        label="루틴 만들기"
        onClick={() => {
          setEditing(null);
          setPrefill(null);
          setSheetOpen(true);
        }}
      />

      {sheetOpen && (
        <RoutineSheet
          key={editing?.id ?? prefill?.title ?? "new"}
          onClose={() => setSheetOpen(false)}
          routine={editing}
          prefill={prefill}
          existingTitles={titles}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="루틴을 삭제할까요?"
        description={`'${pendingDelete?.title ?? ""}' 루틴을 삭제해요. 이미 만들어진 할 일 기록은 그대로 남아요.`}
        confirmLabel="삭제"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function Switch({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-sage-500" : "bg-ink-200",
        disabled && "opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[calc(100%-1.375rem)]" : "left-0.5",
        )}
      />
    </button>
  );
}
