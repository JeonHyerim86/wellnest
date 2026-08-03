/**
 * 날짜 유틸 — 모든 "오늘" 판단은 Asia/Seoul 기준으로 통일한다.
 * 서버(UTC)와 클라이언트(KST)의 날짜가 어긋나는 문제를 막기 위함.
 */

const TIME_ZONE = "Asia/Seoul";

/** Asia/Seoul 기준 YYYY-MM-DD */
export function todayInSeoul(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Asia/Seoul 기준 요일 (0=일 ~ 6=토) */
export function todayWeekdayInSeoul(): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
  }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function weekdayLabel(day: number) {
  return WEEKDAY_LABELS[day] ?? "";
}

/** [0,1,2,3,4,5,6] → "매일", [1,3,5] → "월 · 수 · 금" */
export function formatRepeatDays(days: number[]): string {
  if (days.length === 0 || days.length === 7) return "매일";
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.join() === "1,2,3,4,5") return "주중";
  if (sorted.join() === "0,6") return "주말";
  return sorted.map(weekdayLabel).join(" · ");
}

/** "2026-08-03" → "8월 3일 월요일" */
export function formatFullDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

/** 목록 그룹 헤더용 — 오늘 / 어제 / 8월 1일 (금) */
export function formatGroupDate(isoDate: string): string {
  const today = todayInSeoul();
  if (isoDate === today) return "오늘";

  // setDate() 는 서버 로컬 타임존 기준이라 DST 지역에서 하루가 어긋난다.
  // 절대 시간에서 24시간을 빼고 서울 기준으로 다시 포맷한다.
  const yesterday = new Date(
    Date.parse(`${today}T00:00:00+09:00`) - 24 * 60 * 60 * 1000,
  );
  const yesterdayIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(yesterday);
  if (isoDate === yesterdayIso) return "어제";

  const date = new Date(`${isoDate}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}
