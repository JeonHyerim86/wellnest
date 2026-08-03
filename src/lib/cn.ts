import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * globals.css 의 @theme 에 정의한 커스텀 타이포 스케일.
 * tailwind-merge 는 `text-*` 를 기본적으로 "텍스트 색상"으로 해석하기 때문에,
 * 등록하지 않으면 `cn("text-overline", "text-meal")` 에서 크기 클래스가
 * 색상 클래스에 밀려 조용히 사라진다. (배지가 10px 대신 16px로 렌더링되던 원인)
 */
const FONT_SIZES = [
  "display",
  "title",
  "headline",
  "subtitle",
  "body",
  "field",
  "chip",
  "label",
  "caption",
  "micro",
  "overline",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
    },
  },
});

/** Tailwind 클래스 병합 유틸 — 나중에 오는 클래스가 이긴다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
