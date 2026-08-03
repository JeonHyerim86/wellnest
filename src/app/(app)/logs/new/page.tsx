import { AppBar, BackButton } from "@/components/ui/app-bar";
import { LogForm } from "@/features/logs/log-form";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "기록 추가 · Wellnest" };

export default async function NewLogPage() {
  await requireUser();

  return (
    <>
      <AppBar title="기록 추가" leading={<BackButton href="/logs" />} />
      <main className="app-shell px-4 pt-4">
        <LogForm />
      </main>
    </>
  );
}
