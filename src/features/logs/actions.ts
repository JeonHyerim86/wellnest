"use server";

import { revalidatePath } from "next/cache";

import { ACTION_ERRORS, requireUser, type ActionResult } from "@/lib/auth";
import { todayInSeoul } from "@/lib/date";
import { LOG_IMAGE_BUCKET } from "@/lib/storage";
import {
  removeObjectByPath,
  removeObjectByUrl,
  uploadImage,
} from "@/lib/storage.server";
import type { LogType, MealType } from "@/lib/supabase/types";

const TITLE_MAX = 120;
const MEMO_MAX = 500;
const CALORIES_MAX = 10_000;
const DURATION_MAX = 1_440;

type NormalizedLog = {
  log_type: LogType;
  logged_on: string;
  title: string;
  memo: string | null;
  meal_type: MealType | null;
  calories: number | null;
  duration_min: number | null;
};

function parseOptionalInt(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : Number.NaN;
}

function normalize(formData: FormData):
  | { error: string }
  | { value: NormalizedLog } {
  const logType = String(formData.get("logType") ?? "meal") as LogType;
  if (logType !== "meal" && logType !== "workout") {
    return { error: "기록 종류를 다시 선택해 주세요." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "무엇을 기록할지 입력해 주세요." };
  if (title.length > TITLE_MAX)
    return { error: `제목은 ${TITLE_MAX}자까지 입력할 수 있어요.` };

  const memo = String(formData.get("memo") ?? "").trim();
  if (memo.length > MEMO_MAX)
    return { error: `메모는 ${MEMO_MAX}자까지 입력할 수 있어요.` };

  const loggedOn = String(formData.get("loggedOn") ?? "").trim() || todayInSeoul();
  // E7: 미래 날짜는 허용하지 않는다.
  if (loggedOn > todayInSeoul()) {
    return { error: "미래 날짜는 선택할 수 없어요." };
  }

  // E4: 타입에 맞지 않는 필드는 항상 null로 정규화해 CHECK 제약 위반을 막는다.
  let mealType: MealType | null = null;
  let calories: number | null = null;
  let durationMin: number | null = null;

  if (logType === "meal") {
    const rawMealType = String(formData.get("mealType") ?? "").trim();
    mealType = (["breakfast", "lunch", "dinner", "snack"] as const).includes(
      rawMealType as MealType,
    )
      ? (rawMealType as MealType)
      : null;

    calories = parseOptionalInt(formData.get("calories"));
    if (calories !== null && (Number.isNaN(calories) || calories < 0)) {
      return { error: "칼로리는 0 이상의 숫자를 입력해 주세요." };
    }
    if (calories !== null && calories > CALORIES_MAX) {
      return { error: `칼로리는 ${CALORIES_MAX.toLocaleString()}kcal 이하로 입력해 주세요.` };
    }
  } else {
    durationMin = parseOptionalInt(formData.get("durationMin"));
    if (durationMin !== null && (Number.isNaN(durationMin) || durationMin < 0)) {
      return { error: "운동 시간은 0 이상의 숫자를 입력해 주세요." };
    }
    if (durationMin !== null && durationMin > DURATION_MAX) {
      return { error: "운동 시간은 1,440분(24시간) 이하로 입력해 주세요." };
    }
  }

  return {
    value: {
      log_type: logType,
      logged_on: loggedOn,
      title,
      memo: memo || null,
      meal_type: mealType,
      calories,
      duration_min: durationMin,
    },
  };
}

function pickImageFile(formData: FormData): File | null {
  const entry = formData.get("image");
  if (entry instanceof File && entry.size > 0) return entry;
  return null;
}

function revalidate(logId?: string) {
  revalidatePath("/");
  revalidatePath("/logs");
  revalidatePath("/profile");
  if (logId) {
    revalidatePath(`/logs/${logId}`);
    revalidatePath(`/logs/${logId}/edit`);
  }
}

export async function createLog(formData: FormData): Promise<ActionResult> {
  const normalized = normalize(formData);
  if ("error" in normalized) return { ok: false, message: normalized.error };

  const { supabase, user } = await requireUser();

  let imageUrl: string | null = null;
  let uploadedPath: string | null = null;

  const file = pickImageFile(formData);
  if (file) {
    const uploaded = await uploadImage(
      supabase,
      LOG_IMAGE_BUCKET,
      user.id,
      file,
    );
    if (!uploaded.ok) return { ok: false, message: uploaded.message };
    imageUrl = uploaded.url;
    uploadedPath = uploaded.path;
  }

  const { error } = await supabase.from("logs").insert({
    ...normalized.value,
    user_id: user.id,
    image_url: imageUrl,
  });

  if (error) {
    // E4: DB 저장이 실패하면 방금 올린 파일을 되돌린다.
    if (uploadedPath) {
      await removeObjectByPath(supabase, LOG_IMAGE_BUCKET, uploadedPath);
    }
    console.error("[createLog]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }

  revalidate();
  return { ok: true };
}

export async function updateLog(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const normalized = normalize(formData);
  if ("error" in normalized) return { ok: false, message: normalized.error };

  const { supabase, user } = await requireUser();

  const { data: existing, error: selectError } = await supabase
    .from("logs")
    .select("id, image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("[updateLog:select]", selectError.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!existing) return { ok: false, message: "이미 삭제된 기록이에요." };

  const removeImage = formData.get("removeImage") === "1";
  const file = pickImageFile(formData);

  let imageUrl: string | null = existing.image_url;
  let uploadedPath: string | null = null;

  if (file) {
    const uploaded = await uploadImage(
      supabase,
      LOG_IMAGE_BUCKET,
      user.id,
      file,
    );
    if (!uploaded.ok) return { ok: false, message: uploaded.message };
    imageUrl = uploaded.url;
    uploadedPath = uploaded.path;
  } else if (removeImage) {
    imageUrl = null;
  }

  const { data, error } = await supabase
    .from("logs")
    .update({ ...normalized.value, image_url: imageUrl })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    if (uploadedPath) {
      await removeObjectByPath(supabase, LOG_IMAGE_BUCKET, uploadedPath);
    }
    console.error("[updateLog]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    // 다른 탭에서 그 사이 삭제된 경우. 에러가 아니라 0행이므로 위 분기에 걸리지 않는다.
    // 방금 올린 파일이 고아로 남지 않도록 여기서도 롤백한다.
    if (uploadedPath) {
      await removeObjectByPath(supabase, LOG_IMAGE_BUCKET, uploadedPath);
    }
    return { ok: false, message: "이미 삭제된 기록이에요." };
  }

  // DB 저장이 확정된 뒤에 이전 파일을 정리한다 (E5: 실패해도 흐름을 막지 않음).
  if ((file || removeImage) && existing.image_url) {
    await removeObjectByUrl(supabase, LOG_IMAGE_BUCKET, existing.image_url);
  }

  revalidate(id);
  return { ok: true };
}

export async function deleteLog(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, image_url");

  if (error) {
    console.error("[deleteLog]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: "이미 삭제된 기록이에요." };
  }

  await removeObjectByUrl(supabase, LOG_IMAGE_BUCKET, data[0].image_url);

  revalidate(id);
  return { ok: true };
}
