"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MAX_IMAGE_BYTES, validateImageFile } from "@/lib/storage";

/**
 * 이미지 선택 + 로컬 미리보기 컴포넌트.
 * 실제 업로드는 저장 시점에 서버로 넘긴다 (SPEC-06).
 */
export function ImagePicker({
  initialUrl,
  onChange,
  aspect = "video",
}: {
  initialUrl?: string | null;
  /**
   * file: 새로 선택한 파일 (없으면 변경 없음)
   * removed: 기존 이미지를 지우겠다는 의사
   */
  onChange: (state: { file: File | null; removed: boolean }) => void;
  aspect?: "video" | "square";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialUrl ?? null,
  );
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // createObjectURL로 만든 URL은 반드시 해제한다 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function handleSelect(file: File | undefined) {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setPreviewUrl(url);
    setError(null);
    onChange({ file, removed: false });
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setPreviewUrl(null);
    setError(null);
    onChange({ file: null, removed: true });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label text-ink-700">사진</span>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-field border border-cream-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="선택한 이미지 미리보기"
            className={
              aspect === "video"
                ? "aspect-video w-full object-cover"
                : "aspect-square w-full object-cover"
            }
          />
          <div className="flex gap-2 border-t border-cream-200 bg-cream-50 p-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              leadingIcon={<Icon name="autorenew" size={15} />}
              onClick={() => inputRef.current?.click()}
            >
              교체
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              fullWidth
              leadingIcon={<Icon name="delete" size={15} />}
              onClick={handleRemove}
            >
              삭제
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-field border border-dashed border-cream-300 bg-cream-100/60 text-ink-500 transition-colors hover:bg-cream-100"
        >
          <Icon name="image" size={26} />
          <span className="text-caption">사진 추가</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(event) => handleSelect(event.target.files?.[0])}
      />

      <p className={error ? "text-caption text-danger" : "text-caption text-ink-500"}>
        {error ??
          `JPG · PNG · WebP · ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB 이하`}
      </p>
    </div>
  );
}
