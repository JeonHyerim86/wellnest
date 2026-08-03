import { NextResponse, type NextRequest } from "next/server";

import { ensureProfile } from "@/features/profile/defaults";
import { createClient } from "@/lib/supabase/server";

/**
 * Google OAuth 콜백 (SPEC-01).
 * Supabase가 붙여 보낸 code를 세션으로 교환한 뒤 원래 가려던 경로로 보낸다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const oauthError = searchParams.get("error");

  // E1: 사용자가 구글 동의 화면에서 취소한 경우
  if (oauthError) {
    const reason = oauthError === "access_denied" ? "cancelled" : "invalid";
    return NextResponse.redirect(`${origin}/login?error=${reason}`);
  }

  // E2: code 누락 / 변조
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] 세션 교환 실패:", error.message);
    return NextResponse.redirect(`${origin}/login?error=invalid`);
  }

  // 첫 화면이 그려지기 전에 profiles 행을 보장한다.
  // 여기서 받은 user 에는 구글 메타데이터가 확실히 채워져 있다 (DB 트리거는 그렇지 않을 수 있다).
  if (data.user) {
    try {
      await ensureProfile(supabase, data.user);
    } catch (cause) {
      // 프로필 보정이 실패해도 로그인 자체는 막지 않는다.
      // 화면은 구글 메타데이터로 같은 이름을 계산하므로 표시에는 문제가 없다.
      console.error("[auth/callback] 프로필 초기화 실패:", cause);
    }
  }

  // open redirect 방지 — 앱 내부 경로만 허용한다.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
