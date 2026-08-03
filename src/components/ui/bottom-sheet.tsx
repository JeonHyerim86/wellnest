"use client";

import { useEffect } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  // 시트가 열려 있는 동안 배경 스크롤을 막고, ESC로 닫는다.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "app-shell relative max-h-[85dvh] overflow-y-auto rounded-t-sheet bg-white pb-6 shadow-sheet",
          "animate-[sheet-up_180ms_ease-out]",
          className,
        )}
      >
        <div className="sticky top-0 z-10 bg-white pt-3">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink-200" />
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="text-headline text-ink-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="grid size-8 place-items-center rounded-full bg-cream-100 text-ink-500 transition-colors hover:bg-cream-200"
            >
              <Icon name="close" size={17} />
            </button>
          </div>
        </div>
        <div className="px-5">{children}</div>
      </div>

      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(16px); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
