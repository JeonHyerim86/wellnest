import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { SectionHeader } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { TodayRoutines } from "@/features/routines/today-routines";
import { TodayTodos } from "@/features/todos/today-todos";
import { LogCard } from "@/features/logs/log-card";
import { requireUser } from "@/lib/auth";
import { formatFullDate, todayInSeoul, todayWeekdayInSeoul } from "@/lib/date";
import type { Routine, Todo, WellnessLog } from "@/lib/supabase/types";

export const metadata = { title: "오늘 · Wellnest" };

export default async function TodayPage() {
  const { supabase, user } = await requireUser();
  const today = todayInSeoul();
  const weekday = todayWeekdayInSeoul();

  const [profileResult, routinesResult, todosResult, logsResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("routines")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .eq("due_date", today)
        .order("created_at", { ascending: true }),
      supabase
        .from("logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("logged_on", today)
        .order("created_at", { ascending: true }),
    ]);

  const profile = profileResult.data;
  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "회원";
  // 프로필 사진의 출처는 profiles.avatar_url 하나뿐이다.
  // 구글 메타데이터로 폴백하면 사진 삭제 후에도 이 화면에만 구글 사진이 남아
  // 프로필 화면과 다르게 보인다. (최초 가입 시 구글 사진은 DB 트리거가 넣어준다)
  const avatarUrl = profile?.avatar_url ?? null;

  // 오늘 요일에 해당하는 루틴만 남긴다 (빈 배열 = 매일)
  const allRoutines = (routinesResult.data ?? []) as Routine[];
  const todayRoutines = allRoutines.filter(
    (routine) =>
      routine.repeat_days.length === 0 || routine.repeat_days.includes(weekday),
  );

  const allTodos = (todosResult.data ?? []) as Todo[];
  const logs = (logsResult.data ?? []) as WellnessLog[];

  // 루틴에서 파생된 할 일은 "오늘의 루틴" 섹션이 담당하므로 목록에서는 제외한다.
  const plainTodos = allTodos
    .filter((todo) => todo.routine_id === null)
    .sort(sortTodos);

  const doneMap: Record<string, boolean> = {};
  for (const todo of allTodos) {
    if (todo.routine_id) doneMap[todo.routine_id] = todo.is_done;
  }

  const routineDone = todayRoutines.filter((r) => doneMap[r.id]).length;
  const todoDone = plainTodos.filter((todo) => todo.is_done).length;
  const total = todayRoutines.length + plainTodos.length;
  const completed = routineDone + todoDone;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const loadFailed =
    routinesResult.error || todosResult.error || logsResult.error;
  const isBrandNew =
    !loadFailed && allRoutines.length === 0 && allTodos.length === 0 && logs.length === 0;

  const cheer =
    rate === 100
      ? "오늘 목표를 모두 해냈어요 🎉"
      : rate >= 50
        ? "잘 하고 있어요, 거의 다 왔어요!"
        : "작은 것부터 하나씩 시작해 볼까요?";

  return (
    <>
      <main className="app-shell flex flex-col gap-6 px-5 pb-2 pt-3">
        {loadFailed && (
          <ErrorState message="오늘 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." />
        )}

        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-caption font-bold text-sage-600">
              {formatFullDate(today)}
            </p>
            <h1 className="text-title text-ink-800">
              안녕하세요, {displayName}님 👋
            </h1>
          </div>
          <Link href="/profile" aria-label="프로필로 이동">
            <Avatar src={avatarUrl} name={displayName} size={44} />
          </Link>
        </header>

        {/* 달성률 — .pen ProgressCard 와 동일하게 브랜드 컬러를 배경으로 쓴다 */}
        <section className="rounded-card bg-sage-500 p-[18px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-label text-white">오늘의 웰니스</p>
              <p className="text-caption text-white/80">{cheer}</p>
            </div>
            <p className="text-[24px] font-extrabold leading-none text-white">
              {rate}%
            </p>
          </div>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              style={{ width: `${rate}%` }}
              className="h-full rounded-full bg-white transition-[width] duration-300"
            />
          </div>

          <div className="mt-4 flex gap-2.5">
            {[
              { v: `${routineDone}/${todayRoutines.length}`, l: "루틴" },
              { v: `${todoDone}/${plainTodos.length}`, l: "할 일" },
              { v: `${logs.length}`, l: "기록" },
            ].map((stat) => (
              <div
                key={stat.l}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-xl bg-white/[0.12] py-2"
              >
                <span className="text-[17px] font-extrabold text-white">
                  {stat.v}
                </span>
                <span className="text-overline text-white/80">{stat.l}</span>
              </div>
            ))}
          </div>
        </section>

        {isBrandNew ? (
          <EmptyState
            emoji="🌿"
            title="Wellnest에 오신 걸 환영해요"
            description="첫 루틴을 만들어 하루를 시작해 보세요"
            action={
              <Link
                href="/routines"
                className="inline-flex h-11 items-center rounded-field bg-sage-500 px-5 text-label font-semibold text-white"
              >
                루틴 만들기
              </Link>
            }
          />
        ) : (
          <>
            <TodayRoutines routines={todayRoutines} doneMap={doneMap} />
            <TodayTodos todos={plainTodos} today={today} />

            <section>
              <SectionHeader
                title="오늘 기록"
                action={
                  <Link
                    href="/logs"
                    className="rounded-full px-2 py-1 text-caption font-bold text-ink-500 hover:bg-ink-100"
                  >
                    전체보기
                  </Link>
                }
              />
              {logs.length === 0 ? (
                <EmptyState
                  emoji="🍽"
                  title="오늘 기록이 아직 없어요"
                  description="식단이나 운동을 남겨보세요"
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map((log) => (
                    <LogCard key={log.id} log={log} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

const PRIORITY_WEIGHT = { high: 0, normal: 1, low: 2 } as const;

function sortTodos(a: Todo, b: Todo) {
  if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
  const weight = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  if (weight !== 0) return weight;
  return a.created_at.localeCompare(b.created_at);
}
