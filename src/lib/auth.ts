import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * 서버에서 로그인 사용자를 강제한다.
 * user_id는 항상 여기서 얻은 값을 쓰고, 클라이언트가 보낸 값을 신뢰하지 않는다.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export const ACTION_ERRORS = {
  notFound: "이미 삭제된 항목이에요.",
  forbidden: "권한이 없어요.",
  unknown: "저장에 실패했어요. 다시 시도해 주세요.",
} as const;
