"use client";

import { Button } from "@/components/ui/button";

/**
 * 되돌릴 수 없는 동작(삭제, 로그아웃) 확인용 모달.
 * 브라우저 기본 confirm()은 사용하지 않는다 — 스타일 통일 + 자동화 도구 호환.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 grid place-items-center px-6">
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        className="absolute inset-0 bg-ink-900/40"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-card bg-white p-5 shadow-sheet"
      >
        <h2 className="text-headline text-ink-800">{title}</h2>
        {description && (
          <p className="mt-2 text-body text-ink-600">{description}</p>
        )}
        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
