"use client";

import { cn } from "@/lib/cn";

type Tone = "neutral" | "sage" | "meal" | "workout" | "danger";

const TONES: Record<Tone, { on: string; off: string }> = {
  neutral: {
    on: "bg-ink-800 text-white border-ink-800",
    off: "bg-white text-ink-600 border-cream-300",
  },
  sage: {
    on: "bg-sage-500 text-white border-sage-500",
    off: "bg-white text-sage-700 border-sage-200",
  },
  meal: {
    on: "bg-meal text-white border-meal",
    off: "bg-meal-bg text-[#a8613a] border-transparent",
  },
  workout: {
    on: "bg-workout text-white border-workout",
    off: "bg-workout-bg text-[#3d6a85] border-transparent",
  },
  danger: {
    on: "bg-danger text-white border-danger",
    off: "bg-danger-bg text-danger border-transparent",
  },
};

export function Chip({
  children,
  tone = "neutral",
  selected = false,
  onClick,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const styles = TONES[tone];
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-pressed={interactive ? selected : undefined}
      className={cn(
        // .pen C/Chip — 높이 35 · padding [8,16] · 라벨 13/700
        "inline-flex h-[35px] items-center justify-center rounded-full border px-4 text-chip transition-colors",
        interactive
          ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
          : "cursor-default",
        selected ? styles.on : styles.off,
        className,
      )}
    >
      {children}
    </button>
  );
}
