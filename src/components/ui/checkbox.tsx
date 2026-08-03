"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function CheckCircle({
  checked,
  onToggle,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** 스크린리더용 설명 */
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        // 터치 타깃 44px 확보 — 추후 앱 전환 시에도 동일 기준
        "grid size-11 shrink-0 place-items-center rounded-full transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500",
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-sage-50",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-[26px] place-items-center rounded-full border-2 transition-all",
          checked
            ? "border-sage-500 bg-sage-500 text-white"
            : "border-cream-300 bg-transparent",
        )}
      >
        {checked && <Icon name="check" size={18} weight={700} />}
      </span>
    </button>
  );
}
