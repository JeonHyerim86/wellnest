"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ACTION_ERRORS, requireUser, type ActionResult } from "@/lib/auth";
import { AVATAR_BUCKET } from "@/lib/storage";
import {
  removeObjectByPath,
  removeObjectByUrl,
  uploadImage,
} from "@/lib/storage.server";

const NAME_MAX = 20;

function revalidate() {
  revalidatePath("/", "layout");
}

export async function updateDisplayName(name: string): Promise<ActionResult> {
  const displayName = name.trim();
  if (!displayName) return { ok: false, message: "닉네임을 입력해 주세요." };
  if (displayName.length > NAME_MAX)
    return { ok: false, message: `닉네임은 ${NAME_MAX}자까지 입력할 수 있어요.` };

  const { supabase, user } = await requireUser();
  // update 가 아니라 upsert — 트리거 실패 등으로 profiles 행이 없을 때
  // 0행 업데이트가 조용히 성공으로 보고되는 것을 막는다 (SPEC-07 E1).
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email, display_name: displayName });

  if (error) {
    console.error("[updateDisplayName]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }

  revalidate();
  return { ok: true };
}

export async function updateAvatar(formData: FormData): Promise<ActionResult> {
  const entry = formData.get("avatar");
  if (!(entry instanceof File) || entry.size === 0) {
    return { ok: false, message: "이미지를 선택해 주세요." };
  }

  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const uploaded = await uploadImage(supabase, AVATAR_BUCKET, user.id, entry);
  if (!uploaded.ok) return { ok: false, message: uploaded.message };

  // upsert 로 처리해 profiles 행이 없어도 사진이 유실되지 않게 한다.
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email, avatar_url: uploaded.url });

  if (error) {
    await removeObjectByPath(supabase, AVATAR_BUCKET, uploaded.path);
    console.error("[updateAvatar]", error.message);
    return { ok: false, message: "사진 업로드에 실패했어요." };
  }

  // 이전 아바타 정리 — 구글에서 받아온 외부 URL이면 경로 역산이 실패하므로 자동으로 건너뛴다.
  await removeObjectByUrl(supabase, AVATAR_BUCKET, profile?.avatar_url);

  revalidate();
  return { ok: true };
}

/**
 * 프로필 사진을 지우고 기본 이미지(세이지 원 + 🙂)로 되돌린다.
 * Storage 파일도 함께 정리한다. 구글에서 받아온 외부 URL이면
 * objectPathFromPublicUrl 이 null 을 돌려주므로 자동으로 건너뛴다.
 */
export async function removeAvatar(): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.avatar_url) {
    return { ok: false, message: "이미 기본 이미지예요." };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email, avatar_url: null });

  if (error) {
    console.error("[removeAvatar]", error.message);
    return { ok: false, message: ACTION_ERRORS.unknown };
  }

  // DB 반영이 확정된 뒤 파일을 지운다. 실패해도 사용자 흐름은 막지 않는다.
  await removeObjectByUrl(supabase, AVATAR_BUCKET, profile.avatar_url);

  revalidate();
  return { ok: true };
}

export async function signOut() {
  const { supabase } = await requireUser();
  // E7: 실패하더라도 사용자가 로그인 상태에 갇히지 않도록 항상 /login으로 보낸다.
  const { error } = await supabase.auth.signOut();
  if (error) console.error("[signOut]", error.message);

  revalidate();
  redirect("/login");
}
