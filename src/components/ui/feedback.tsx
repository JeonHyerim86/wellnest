import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function EmptyState({
  emoji,
  title,
  description,
  action,
  className,
}: {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border border-dashed border-cream-300 bg-cream-100/60 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-label text-ink-700">{title}</p>
      {description && <p className="text-caption text-ink-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = "정보를 불러오지 못했어요.",
  action,
}: {
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-danger/20 bg-danger-bg px-6 py-8 text-center">
      <span className="text-2xl" aria-hidden>
        ⚠️
      </span>
      <p className="text-label text-danger">{message}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-field bg-cream-200", className)}
    />
  );
}

export function ProgressBar({
  value,
  className,
}: {
  /** 0 ~ 100 */
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-cream-200", className)}
    >
      <div
        style={{ width: `${clamped}%` }}
        className="h-full rounded-full bg-sage-500 transition-[width] duration-300"
      />
    </div>
  );
}
