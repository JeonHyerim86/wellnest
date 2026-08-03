import { BottomTabBar } from "@/components/ui/bottom-tab-bar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream-50">
      {/* 하단 탭바(약 64px) + 여유 공간만큼 아래쪽을 비워둔다 */}
      <div className="flex-1 pb-24">{children}</div>
      <BottomTabBar />
    </div>
  );
}
