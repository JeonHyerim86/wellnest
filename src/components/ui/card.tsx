import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-tile bg-white shadow-card", className)}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1 pb-2.5">
      <h2 className="text-headline text-ink-800">{title}</h2>
      {action}
    </div>
  );
}
