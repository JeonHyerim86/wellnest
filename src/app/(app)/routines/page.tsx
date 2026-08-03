import { AppBar } from "@/components/ui/app-bar";
import { ErrorState } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { RoutineManager } from "@/features/routines/routine-manager";
import { requireUser } from "@/lib/auth";
import { todayWeekdayInSeoul, weekdayLabel } from "@/lib/date";
import type { Routine } from "@/lib/supabase/types";

export const metadata = { title: "루틴 · Wellnest" };

export default async function RoutinesPage() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", user.id)
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const routines = (data ?? []) as Routine[];

  const weekday = todayWeekdayInSeoul();
  const todayCount = routines.filter(
    (routine) =>
      routine.is_active &&
      (routine.repeat_days.length === 0 ||
        routine.repeat_days.includes(weekday)),
  ).length;

  return (
    <>
      <AppBar title="루틴" subtitle="ROUTINE" />
      <main className="app-shell flex flex-col gap-3 px-4 pt-4">
        {error ? (
          <ErrorState message="루틴을 불러오지 못했어요." />
        ) : (
          <>
            <p className="px-1 text-caption text-ink-500">
              반복 요일을 정해두면 해당 요일에 오늘 화면에 자동으로 나타나요.
            </p>

            {/* .pen Screen · Routines 의 Summary 배너 */}
            <div className="flex items-center gap-2.5 rounded-tile bg-sage-100 px-4 py-3.5">
              <Icon
                name="event_available"
                size={19}
                className="text-sage-600"
              />
              <p className="text-caption font-bold text-sage-600">
                {todayCount > 0
                  ? `오늘은 ${weekdayLabel(weekday)}요일 · ${todayCount}개의 루틴이 예정돼 있어요`
                  : `오늘은 ${weekdayLabel(weekday)}요일 · 예정된 루틴이 없어요`}
              </p>
            </div>

            <RoutineManager routines={routines} />
          </>
        )}
      </main>
    </>
  );
}
