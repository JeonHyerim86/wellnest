import { Suspense } from "react";

import { LoginPanel } from "@/features/profile/login-panel";

export const metadata = { title: "로그인 · Wellnest" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-between bg-cream-50 px-6 pb-10 pt-16">
      <div className="app-shell flex flex-1 flex-col justify-center">
        <div className="mb-10 text-center">
          <span className="text-5xl" aria-hidden>
            🌿
          </span>
          <h1 className="mt-4 text-display text-ink-900">Wellnest</h1>
          <p className="mt-2 text-body text-ink-500">
            할 일과 루틴, 식단과 운동까지
            <br />
            오늘 하루를 한곳에 담아요
          </p>
        </div>

        <ul className="mb-10 flex flex-col gap-3">
          <Feature emoji="✅" title="루틴은 한 번만 등록" description="반복 요일을 정해두면 매일 자동으로 준비돼요" />
          <Feature emoji="🍽" title="식단·운동을 한 타임라인에" description="사진 한 장으로 오늘을 기록해요" />
          <Feature emoji="📈" title="하루 달성률 확인" description="오늘 얼마나 해냈는지 바로 보여줘요" />
        </ul>

        <Suspense fallback={null}>
          <LoginPanel />
        </Suspense>
      </div>
    </main>
  );
}

function Feature({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-card bg-white/70 px-4 py-3">
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <div>
        <p className="text-label text-ink-800">{title}</p>
        <p className="text-caption text-ink-500">{description}</p>
      </div>
    </li>
  );
}
