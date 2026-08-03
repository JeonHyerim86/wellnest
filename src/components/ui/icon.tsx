import { cn } from "@/lib/cn";

/**
 * design/wellnest.pen 의 아이코노그래피 규칙을 코드로 옮긴 것.
 * 라이브러리: Material Symbols Rounded 단일
 * 크기: 13 / 17 / 20 / 22 / 26
 * 웨이트: 400(비활성) · 600(기본) · 700(주요 액션)
 */
export type IconName =
  | "add"
  | "arrow_back_ios_new"
  | "autorenew"
  | "badge"
  | "calendar_month"
  | "check"
  | "check_circle"
  | "chevron_right"
  | "close"
  | "delete"
  | "directions_run"
  | "eco"
  | "edit"
  | "error"
  | "event_available"
  | "event_repeat"
  | "home"
  | "image"
  | "info"
  | "keyboard_arrow_down"
  | "local_fire_department"
  | "logout"
  | "more_horiz"
  | "notifications"
  | "person"
  | "photo_camera"
  | "priority_high"
  | "remove"
  | "restaurant"
  | "schedule"
  | "trending_up";

export function Icon({
  name,
  size = 22,
  weight = 600,
  filled = false,
  className,
}: {
  name: IconName;
  size?: number;
  /** 400 · 600 · 700 */
  weight?: 400 | 600 | 700;
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("ms-icon shrink-0", className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" 24`,
      }}
    >
      {name}
    </span>
  );
}
