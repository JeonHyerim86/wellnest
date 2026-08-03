import type { SupabaseClient, UserMetadata } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

/**
 * 프로필 기본값의 단일 출처.
 *
 * 예전에는 오늘 화면과 프로필 화면이 "profiles 행이 없을 때" 를 각자 다르게 처리했다.
 *   - 오늘 화면   : 이메일 앞부분 + 앱 기본 이미지 (읽기만)
 *   - 프로필 화면 : 구글 이름 + 구글 사진으로 행을 새로 만듦 (쓰기까지)
 * 그래서 첫 로그인 직후에는 이메일이 보이다가, 프로필 탭을 한 번 들어갔다 오면
 * 오늘 화면의 이름과 사진까지 바뀌어 있었다. 규칙을 여기 한 곳으로 모은다.
 */

type IdentitySource = {
  id: string;
  email?: string | null;
  user_metadata?: UserMetadata | null;
};

function trimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * 구글 로그인 사용자의 기본 표시 이름.
 * 구글 이름(full_name → name)을 우선 쓰고, 없을 때만 이메일 앞부분으로 내려간다.
 */
export function defaultDisplayName(user: IdentitySource): string {
  const meta = user.user_metadata ?? {};
  const fromGoogle = trimmed(meta.full_name) || trimmed(meta.name);
  if (fromGoogle) return fromGoogle;

  return trimmed(user.email).split("@")[0] || "회원";
}

/**
 * 화면에 보여줄 이름.
 * 사용자가 직접 정한 닉네임이 있으면 그것이 우선, 없으면 구글 이름.
 * 모든 화면이 이 함수를 거치므로 화면마다 다른 이름이 나올 수 없다.
 */
export function resolveDisplayName(
  savedName: string | null | undefined,
  user: IdentitySource,
): string {
  return trimmed(savedName) || defaultDisplayName(user);
}

/**
 * 로그인 직후 profiles 행을 보장한다. auth/callback 에서 한 번만 호출한다.
 *
 * 여기서 하는 이유:
 * DB 트리거(on_auth_user_created)는 auth.users INSERT 직후에 도는데, OAuth 가입은
 * 그 시점에 raw_user_meta_data 가 아직 비어 있을 수 있다. 그러면 구글 이름을 못 읽는다.
 * 반면 exchangeCodeForSession() 이 돌려주는 user 에는 메타데이터가 확실히 채워져 있다.
 *
 * avatar_url 은 일부러 건드리지 않는다 — 기본값은 앱 기본 이미지(null)다.
 * 구글 사진을 복사해 두면 사용자가 지워도 다음 로그인에 되살아나고,
 * 사진의 출처가 profiles.avatar_url 하나라는 규칙도 깨진다.
 */
export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  user: IdentitySource,
): Promise<void> {
  const displayName = defaultDisplayName(user);
  const email = user.email ?? null;

  // 행이 없을 때만 만든다. 이미 있으면 사용자가 바꾼 닉네임을 덮지 않도록 그대로 둔다.
  await supabase
    .from("profiles")
    .upsert(
      { id: user.id, email, display_name: displayName },
      { onConflict: "id", ignoreDuplicates: true },
    );

  // 트리거가 구글 메타데이터 없이 만든 행은 display_name 이 비어 있다. 그때만 채운다.
  await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id)
    .is("display_name", null);
}
