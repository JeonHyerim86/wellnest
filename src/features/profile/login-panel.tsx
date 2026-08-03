"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

/** OAuth 실패 코드 → 사용자에게 보여줄 문구 (SPEC-01 예외 처리) */
const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "로그인이 취소되었어요. 다시 시도해 주세요.",
  invalid: "로그인 처리 중 문제가 생겼어요. 다시 시도해 주세요.",
  config: "로그인 설정에 문제가 있어요. 잠시 후 다시 시도해 주세요.",
};

export function LoginPanel() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorCode = searchParams.get("error");
  const message =
    localError ?? (errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.invalid) : null);

  async function handleGoogleLogin() {
    setLoading(true);
    setLocalError(null);

    try {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          // 구글은 브라우저에 세션이 있고 이미 권한을 승인한 앱이면
          // 계정 선택·동의 화면을 건너뛰고 자동 승인한다.
          // 그러면 계정을 여러 개 쓰는 사용자가 다른 계정을 고를 수 없으므로
          // 매번 계정 선택 화면을 띄우도록 강제한다.
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) throw error;
      // 성공 시 구글 동의 화면으로 이동하므로 로딩 상태를 유지한다.
    } catch {
      setLocalError("네트워크 연결을 확인해 주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {message && (
        <p
          role="alert"
          className="rounded-field bg-danger-bg px-4 py-3 text-caption text-danger"
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex h-13 w-full items-center justify-center gap-3 rounded-field border border-cream-300 bg-white text-body font-semibold text-ink-800 shadow-card transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="size-5 animate-spin rounded-full border-2 border-ink-300 border-t-transparent" />
        ) : (
          <GoogleLogo />
        )}
        {loading ? "연결하는 중…" : "Google로 시작하기"}
      </button>

      <p className="text-center text-caption text-ink-400">
        로그인하면 서비스 이용약관에 동의하게 됩니다
      </p>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
