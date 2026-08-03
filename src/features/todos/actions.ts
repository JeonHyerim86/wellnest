"use server";

import { revalidatePath } from "next/cache";

import { ACTION_ERRORS, requireUser, type ActionResult } from "@/lib/auth";
import { todayInSeoul } from "@/lib/date";
import type { Priority } from "@/lib/supabase/types";

const TITLE_MAX = 120;
const MEMO_MAX = 500;
/** 클라이언트 입력을 런타임에도 검증한다 (서버 액션은 공개 엔드포인트) */
const PRIORITIES: readonly Priority[] = ["low", "normal", "high"];

export type TodoInput = {
  title: string;
  memo?: string | null;
  dueDate?: string;
  priority?: Priority;
};

type NormalizedTodo = {
  title: string;
  memo: string | null;
  due_date: string;
  priority: Priority;
};

function normalize(
  input: TodoInput,
): { error: string } | { value: NormalizedTodo } {
  const title = input.title.trim();
  const memo = input.memo?.trim() ?? "";

  if (!title) return { error: "할 일 제목을 입력해 주세요." };
  if (title.length > TITLE_MAX)
    return { error: `제목은 ${TITLE_MAX}자까지 입력할 수 있어요.` };
  if (memo.length > MEMO_MAX)
    return { error: `메모는 ${MEMO_MAX}자까지 입력할 수 있어요.` };

  return {
    value: {
      title,
      memo: memo || null,
      // ?? 가 아니라 || — 빈 문자열이 그대로 Postgres 로 넘어가 date 파싱에 실패하는 것을 막는다.
      due_date: input.dueDate || todayInSeoul(),
      priority: PRIORITIES.includes(input.priority as Priority)
        ? (input.priority as Priority)
        : "normal",
    },
  };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/routines");
  revalidatePath("/profile");
}

export async function createTodo(input: TodoInput): Promise<ActionResult> {
  const normalized = normalize(input);
  if ("error" in normalized) return { ok: false, message: normalized.error };

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("todos")
    .insert({ ...normalized.value, user_id: user.id, is_done: false, routine_id: null, completed_at: null });

  if (error) {
    console.error("[createTodo]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }

  revalidate();
  return { ok: true };
}

export async function updateTodo(
  id: string,
  input: TodoInput,
): Promise<ActionResult> {
  const normalized = normalize(input);
  if ("error" in normalized) return { ok: false, message: normalized.error };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("todos")
    .update(normalized.value)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("[updateTodo]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  // E5: 다른 탭에서 이미 삭제된 항목
  if (!data || data.length === 0) {
    return { ok: false, message: ACTION_ERRORS.notFound };
  }

  revalidate();
  return { ok: true };
}

export async function toggleTodo(
  id: string,
  isDone: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("todos")
    .update({ is_done: isDone, completed_at: isDone ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("[toggleTodo]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: ACTION_ERRORS.notFound };
  }

  revalidate();
  return { ok: true };
}

export async function deleteTodo(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("[deleteTodo]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: ACTION_ERRORS.notFound };
  }

  revalidate();
  return { ok: true };
}

/**
 * 루틴 체크 (SPEC-02 §2.3).
 * 오늘 날짜의 파생 todo가 없으면 만들고, 있으면 완료 상태만 뒤집는다.
 */
const ROUTINE_GONE = "삭제된 루틴이에요. 화면을 새로고침해 주세요." as const;

export async function toggleRoutineForToday(
  routineId: string,
  nextDone: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const dueDate = todayInSeoul();

  // 제목은 클라이언트가 보낸 값을 믿지 않고 DB에서 직접 읽는다.
  // 서버 액션은 공개 엔드포인트라 임의의 title / 남의 routineId 가 올 수 있다.
  const { data: routine, error: routineError } = await supabase
    .from("routines")
    .select("title")
    .eq("id", routineId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (routineError) {
    console.error("[toggleRoutineForToday:routine]", routineError.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!routine) return { ok: false, message: ROUTINE_GONE };

  const completedAt = nextDone ? new Date().toISOString() : null;

  const { data: existing, error: selectError } = await supabase
    .from("todos")
    .select("id")
    .eq("user_id", user.id)
    .eq("routine_id", routineId)
    .eq("due_date", dueDate)
    .maybeSingle();

  if (selectError) {
    console.error("[toggleRoutineForToday:select]", selectError.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }

  if (!existing) {
    const { error } = await supabase.from("todos").insert({
      user_id: user.id,
      routine_id: routineId,
      title: routine.title,
      memo: null,
      due_date: dueDate,
      priority: "normal",
      is_done: nextDone,
      completed_at: completedAt,
    });

    // 23505 = 부분 유니크 인덱스 충돌. 동시 토글에서 다른 요청이 먼저 만든 것이므로
    // 삭제된 루틴이 아니라 "이미 만들어짐"이다. 아래 update 로 이어서 처리한다.
    if (error && error.code !== "23505") {
      console.error("[toggleRoutineForToday:insert]", error.message);
      return { ok: false, message: ACTION_ERRORS.unknown };
    }
    if (!error) {
      revalidate();
      return { ok: true };
    }
  }

  const { data, error } = await supabase
    .from("todos")
    .update({ is_done: nextDone, completed_at: completedAt })
    .eq("user_id", user.id)
    .eq("routine_id", routineId)
    .eq("due_date", dueDate)
    .select("id");

  if (error) {
    console.error("[toggleRoutineForToday:update]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: ACTION_ERRORS.notFound };
  }

  revalidate();
  return { ok: true };
}
