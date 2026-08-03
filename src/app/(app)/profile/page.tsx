import { AppBar } from "@/components/ui/app-bar";
import { Card } from "@/components/ui/card";
import { ProfilePanel } from "@/features/profile/profile-panel";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "프로필 · Wellnest" };

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();

  const [profileResult, routineCount, doneCount, logCount] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("routines")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("todos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_done", true),
    supabase
      .from("logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  let profile = profileResult.data;

  // E1: 트리거가 실패해 프로필 행이 없으면 세션 정보로 보정한다.
  if (!profile) {
    const fallback = {
      id: user.id,
      email: user.email ?? null,
      display_name:
        (user.user_metadata?.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        null,
      avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    };
    await supabase.from("profiles").upsert(fallback);
    profile = fallback;
  }

  const displayName =
    profile.display_name ?? user.email?.split("@")[0] ?? "회원";

  const stats = [
    { label: "활성 루틴", value: routineCount.count },
    { label: "완료한 할 일", value: doneCount.count },
    { label: "남긴 기록", value: logCount.count },
  ];

  // 가입일로부터 며칠째인지 (가입 당일이 1일째)
  const joinedDays =
    Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (24 * 60 * 60 * 1000),
    ) + 1;

  return (
    <>
      <AppBar title="프로필" subtitle="PROFILE" />
      <main className="app-shell flex flex-col gap-4 px-4 pt-4">
        <ProfilePanel
          displayName={displayName}
          email={profile.email ?? user.email ?? ""}
          avatarUrl={profile.avatar_url}
          joinedDays={joinedDays}
        />

        <Card className="grid grid-cols-3 divide-x divide-cream-200 p-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-title text-sage-600">
                {/* E6: 집계 실패 시 화면 전체를 막지 않고 이 칸만 '-'로 표시 */}
                {stat.value ?? "-"}
              </span>
              <span className="text-caption text-ink-500">{stat.label}</span>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
