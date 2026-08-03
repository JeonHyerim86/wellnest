"use server";

import { revalidatePath } from "next/cache";

import { ACTION_ERRORS, requireUser, type ActionResult } from "@/lib/auth";
import type { RoutineCategory } from "@/lib/supabase/types";

const TITLE_MAX = 60;
/** 클라이언트 입력을 런타임에도 검증한다 (서버 액션은 공개 엔드포인트) */
const CATEGORIES: readonly RoutineCategory[] = [
  "health",
  "meal",
  "mind",
  "life",
];

export type RoutineInput = {
  title: string;
  emoji?: string | null;
  category?: RoutineCategory;
  /** 0(일) ~ 6(토). 빈 배열이면 매일 */
  repeatDays?: number[];
};

type NormalizedRoutine = {
  title: string;
  emoji: string | null;
  category: RoutineCategory;
  repeat_days: number[];
};

function normalize(
  input: RoutineInput,
): { error: string } | { value: NormalizedRoutine } {
  const title = input.title.trim();
  if (!title) return { error: "루틴 이름을 입력해 주세요." };
  if (title.length > TITLE_MAX)
    return { error: `이름은 ${TITLE_MAX}자까지 입력할 수 있어요.` };

  // 0~6 범위 밖의 값과 중복을 제거한다.
  // 배열이 아닌 값이 오면 filter 에서 TypeError → 500 이 되므로 먼저 방어한다.
  const rawDays = Array.isArray(input.repeatDays) ? input.repeatDays : [];
  const repeatDays = Array.from(
    new Set(
      rawDays.filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6,
      ),
    ),
  ).sort((a, b) => a - b);

  return {
    value: {
      title,
      emoji: input.emoji?.trim() || null,
      category: CATEGORIES.includes(input.category as RoutineCategory)
        ? (input.category as RoutineCategory)
        : "life",
      repeat_days: repeatDays,
    },
  };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/routines");
  revalidatePath("/profile");
}

export async function createRoutine(
  input: RoutineInput,
): Promise<ActionResult> {
  const normalized = normalize(input);
  if ("error" in normalized) return { ok: false, message: normalized.error };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("routines").insert({
    ...normalized.value,
    user_id: user.id,
    is_active: true,
    sort_order: 0,
  });

  if (error) {
    console.error("[createRoutine]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }

  revalidate();
  return { ok: true };
}

export async function updateRoutine(
  id: string,
  input: RoutineInput,
): Promise<ActionResult> {
  const normalized = normalize(input);
  if ("error" in normalized) return { ok: false, message: normalized.error };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("routines")
    .update(normalized.value)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("[updateRoutine]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: ACTION_ERRORS.notFound };
  }

  revalidate();
  return { ok: true };
}

export async function toggleRoutineActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("routines")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("[toggleRoutineActive]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: ACTION_ERRORS.notFound };
  }

  revalidate();
  return { ok: true };
}

export async function deleteRoutine(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  // todos.routine_id 는 on delete set null → 파생된 할 일 기록은 보존된다.
  const { data, error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("[deleteRoutine]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: ACTION_ERRORS.notFound };
  }

  revalidate();
  return { ok: true };
}
