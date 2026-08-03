import { notFound } from "next/navigation";

import { AppBar, BackButton } from "@/components/ui/app-bar";
import { LogForm } from "@/features/logs/log-form";
import { requireUser } from "@/lib/auth";
import type { WellnessLog } from "@/lib/supabase/types";

export const metadata = { title: "기록 수정 · Wellnest" };

export default async function EditLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("logs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // 삭제됐거나 다른 사용자의 기록이면 404 (RLS + 명시적 필터 이중 방어)
  if (!data) notFound();

  return (
    <>
      <AppBar title="기록 수정" leading={<BackButton href={`/logs/${id}`} />} />
      <main className="app-shell px-4 pt-4">
        <LogForm log={data as WellnessLog} />
      </main>
    </>
  );
}
