import { AppBar } from "@/components/ui/app-bar";
import { Card } from "@/components/ui/card";
import { resolveDisplayName } from "@/features/profile/defaults";
import { ProfilePanel } from "@/features/profile/profile-panel";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "프로필 · Wellnest" };

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();

  const [profileResult, routineCount, doneCount, logCount] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, email, created_at")
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

  const profile = profileResult.data;

  // E1: 행이 없어도 화면을 그리는 데 문제는 없다. 이름은 구글 메타데이터로 계산하고,
  // 사진은 앱 기본 이미지가 나온다. 행 생성은 로그인 콜백(ensureProfile)이 담당한다.
  //
  // 예전에는 여기서 행을 직접 만들면서 구글 사진까지 넣었다. 그래서 프로필 탭을
  // 한 번 들어갔다 오면 오늘 화면의 이름과 사진이 바뀌어 있었다. 읽기 화면은 쓰지 않는다.
  const displayName = resolveDisplayName(profile?.display_name, user);

  const stats = [
    { label: "활성 루틴", value: routineCount.count },
    { label: "완료한 할 일", value: doneCount.count },
    { label: "남긴 기록", value: logCount.count },
  ];

  // 가입일로부터 며칠째인지 (가입 당일이 1일째).
  // auth.users.created_at 은 JWT 클레임에 없으므로, 가입 시 트리거가 함께 만든
  // profiles.created_at 을 쓴다. 두 값은 같은 시점이다.
  const joinedSince = profile?.created_at ?? new Date().toISOString();
  const joinedDays =
    Math.floor(
      (Date.now() - new Date(joinedSince).getTime()) / (24 * 60 * 60 * 1000),
    ) + 1;

  return (
    <>
      <AppBar title="프로필" subtitle="PROFILE" />
      <main className="app-shell flex flex-col gap-4 px-4 pt-4">
        <ProfilePanel
          displayName={displayName}
          email={profile?.email ?? user.email ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
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
