import { AppBar } from "@/components/ui/app-bar";
import { FabLink } from "@/components/ui/fab";
import { ErrorState } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { LogList } from "@/features/logs/log-list";
import { requireUser } from "@/lib/auth";
import { todayInSeoul } from "@/lib/date";
import type { WellnessLog } from "@/lib/supabase/types";

export const metadata = { title: "기록 · Wellnest" };

export default async function LogsPage() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false });

  const logs = (data ?? []) as WellnessLog[];

  // .pen Screen · Logs 의 "오늘 770 kcal" 합계 칩
  const today = todayInSeoul();
  const todayCalories = logs
    .filter((log) => log.logged_on === today && log.log_type === "meal")
    .reduce((sum, log) => sum + (log.calories ?? 0), 0);

  return (
    <>
      <AppBar
        title="기록"
        subtitle="LOG"
        trailing={
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5">
            <Icon
              name="local_fire_department"
              size={14}
              className="text-meal"
            />
            <span className="text-[11px] font-bold text-ink-500">
              오늘 {todayCalories.toLocaleString()} kcal
            </span>
          </span>
        }
      />
      <main className="app-shell px-4 pt-4">
        {error ? (
          <ErrorState message="기록을 불러오지 못했어요." />
        ) : (
          <LogList logs={logs} />
        )}
      </main>
      <FabLink label="기록 추가" href="/logs/new" />
    </>
  );
}
