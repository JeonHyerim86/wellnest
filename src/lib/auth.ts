import type { UserMetadata } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** 화면과 서버 액션이 실제로 쓰는 사용자 정보. 모두 JWT 클레임에 들어 있는 값이다. */
export type SessionUser = {
  id: string;
  email: string | null;
  user_metadata: UserMetadata;
};

/**
 * 서버에서 로그인 사용자를 강제한다.
 * user_id는 항상 여기서 얻은 값을 쓰고, 클라이언트가 보낸 값을 신뢰하지 않는다.
 *
 * getUser() 가 아니라 getClaims() 를 쓰는 이유:
 * - getUser() 는 호출할 때마다 Supabase auth 서버로 HTTP 왕복을 한 번 한다.
 *   proxy 에서 한 번, 여기서 또 한 번 돌아서 탭 이동마다 왕복 2회가 생겼다(측정 ~640ms).
 * - 이 프로젝트의 JWT 는 ES256(비대칭) 서명이라 getClaims() 가 JWKS 공개키로
 *   crypto.subtle.verify() 로컬 검증을 한다. JWKS 는 auth-js 의 모듈 전역 캐시에
 *   저장되므로 워밍된 인스턴스에서는 네트워크 왕복이 0회다.
 * - 서명을 실제로 검증하기 때문에 쿠키를 그대로 믿는 getSession() 과는 다르다.
 * - 액세스 토큰이 만료됐으면 getClaims() 내부의 getSession() 이 리프레시 토큰으로
 *   자동 갱신하므로 세션 유지 동작은 그대로다.
 *
 * 트레이드오프: 세션을 강제 폐기해도 이미 발급된 액세스 토큰은 만료 전까지 유효하다.
 * (JWT 방식의 일반적인 성질이며 Supabase 가 권장하는 기본 동작이다.)
 */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;
  if (error || !claims?.sub) redirect("/login");

  const user: SessionUser = {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    user_metadata: claims.user_metadata ?? {},
  };

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
