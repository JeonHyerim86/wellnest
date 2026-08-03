"use client";

import { useState, useTransition } from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { TextField } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createRoutine, updateRoutine } from "@/features/routines/actions";
import { cn } from "@/lib/cn";
import { weekdayLabel } from "@/lib/date";
import type { Routine, RoutineCategory } from "@/lib/supabase/types";

const CATEGORIES: { value: RoutineCategory; label: string }[] = [
  { value: "health", label: "건강" },
  { value: "meal", label: "식단" },
  { value: "mind", label: "마음" },
  { value: "life", label: "생활" },
];

const EMOJI_PRESETS = ["🧘", "💧", "🏃", "🥗", "📖", "😴", "🚶", "💊", "🧹", "✍️"];

const TITLE_MAX = 60;

/** 추천 칩 등에서 생성 시트를 미리 채울 때 쓰는 값 */
export type RoutinePrefill = {
  title: string;
  emoji?: string | null;
  category?: RoutineCategory;
};

/**
 * 부모가 열릴 때만 마운트한다 (`{open && <RoutineSheet key=... />}`).
 * 그래서 초기값 동기화를 위한 useEffect가 필요 없다.
 */
export function RoutineSheet({
  onClose,
  routine,
  prefill,
  existingTitles = [],
}: {
  onClose: () => void;
  routine?: Routine | null;
  prefill?: RoutinePrefill | null;
  /** 중복 이름 경고용 (E4) */
  existingTitles?: string[];
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(routine?.title ?? prefill?.title ?? "");
  const [emoji, setEmoji] = useState<string | null>(
    routine?.emoji ?? prefill?.emoji ?? null,
  );
  const [category, setCategory] = useState<RoutineCategory>(
    routine?.category ?? prefill?.category ?? "life",
  );
  const [repeatDays, setRepeatDays] = useState<number[]>(
    routine?.repeat_days ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(routine);
  const trimmed = title.trim();
  const canSubmit = trimmed.length > 0 && !pending;
  const duplicated =
    trimmed.length > 0 &&
    existingTitles.some(
      (existing) => existing !== routine?.title && existing === trimmed,
    );

  function toggleDay(day: number) {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day],
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;

    startTransition(async () => {
      const input = { title, emoji, category, repeatDays };
      const result = isEdit
        ? await updateRoutine(routine!.id, input)
        : await createRoutine(input);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      toast.success(isEdit ? "수정했어요" : "루틴을 만들었어요");
      onClose();
    });
  }

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={isEdit ? "루틴 수정" : "루틴 만들기"}
    >
      <div className="flex flex-col gap-4">
        <TextField
          id="routine-title"
          label="루틴 이름"
          placeholder="예: 아침 스트레칭"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(event) => {
            setTitle(event.target.value);
            setError(null);
          }}
          counter={`${title.length}/${TITLE_MAX}`}
          hint={duplicated ? "같은 이름의 루틴이 이미 있어요" : undefined}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-label text-ink-700">이모지 (선택)</span>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setEmoji(emoji === preset ? null : preset)}
                aria-pressed={emoji === preset}
                className={cn(
                  "grid size-11 place-items-center rounded-field border text-lg transition-colors",
                  emoji === preset
                    ? "border-sage-400 bg-sage-50"
                    : "border-cream-300 bg-white hover:bg-cream-100",
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-label text-ink-700">카테고리</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((option) => (
              <Chip
                key={option.value}
                tone="sage"
                selected={category === option.value}
                onClick={() => setCategory(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-label text-ink-700">반복 요일</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const selected = repeatDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  aria-pressed={selected}
                  className={cn(
                    "h-11 flex-1 rounded-field border text-label font-medium transition-colors",
                    selected
                      ? "border-sage-500 bg-sage-500 text-white"
                      : "border-cream-300 bg-white text-ink-600 hover:bg-cream-100",
                  )}
                >
                  {weekdayLabel(day)}
                </button>
              );
            })}
          </div>
          <p className="text-caption text-ink-500">
            선택하지 않으면 매일 반복돼요
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-field bg-danger-bg px-3 py-2 text-caption text-danger">
            {error}
          </p>
        )}

        <Button
          size="lg"
          fullWidth
          loading={pending}
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-1"
        >
          저장
        </Button>
      </div>
    </BottomSheet>
  );
}
