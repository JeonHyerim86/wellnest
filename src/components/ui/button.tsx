import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 disabled:bg-ink-200 disabled:text-ink-400",
  secondary:
    "bg-sage-50 text-sage-700 hover:bg-sage-100 active:bg-sage-200 disabled:bg-ink-100 disabled:text-ink-400",
  ghost:
    "bg-transparent text-ink-600 hover:bg-ink-100 active:bg-ink-200 disabled:text-ink-300",
  danger:
    "bg-danger-bg text-danger hover:bg-[#f5dcd9] active:bg-[#efcdc9] disabled:bg-ink-100 disabled:text-ink-400",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-caption rounded-xl",
  md: "h-11 px-4 text-label rounded-field",
  lg: "h-13 px-6 text-body font-extrabold rounded-2xl",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leadingIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      // 요청 진행 중 중복 클릭을 막는다 (모든 스펙의 "연타" 예외 처리)
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors",
        "whitespace-nowrap",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500",
        "disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        // 고정 폭 버튼은 flex 안에서 라벨이 잘리지 않도록 축소를 막는다 (예: [삭제][저장]).
        // fullWidth 버튼은 w-full로 공간을 나눠 가져야 하므로 축소를 허용한다.
        fullWidth ? "w-full min-w-0" : "shrink-0",
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : leadingIcon}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
