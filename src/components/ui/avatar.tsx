"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * design/wellnest.pen 의 C/Avatar.
 * 기본값은 세이지 소프트 원 + Material Symbols `person` 아이콘.
 * 사진이 있으면 원형 크롭해서 채운다.
 *
 * ⚠️ 프로필 사진의 유일한 출처는 `profiles.avatar_url` 이다.
 *    구글 메타데이터(user_metadata.avatar_url)로 폴백하면 사진을 삭제해도
 *    화면마다 다른 이미지가 보이므로 절대 폴백하지 않는다.
 */
export function Avatar({
  src,
  name,
  size = 44,
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-sage-100",
        className,
      )}
    >
      {showImage ? (
        // Storage 도메인이 바뀔 수 있어 next/image 대신 img 사용
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={name ? `${name} 프로필 이미지` : "프로필 이미지"}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <Icon
          name="person"
          size={Math.round(size * 0.53)}
          className="text-sage-600"
        />
      )}
    </span>
  );
}

/**
 * design/wellnest.pen 의 C/AvatarEditable.
 * 아바타 우하단에 카메라 배지를 얹어 "사진 변경" 어포던스를 준다.
 */
export function AvatarEditable({
  src,
  name,
  size = 88,
  loading = false,
  onClick,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  loading?: boolean;
  onClick: () => void;
}) {
  const badge = Math.round(size * 0.32);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="프로필 사진 변경"
      style={{ width: size, height: size }}
      className="relative shrink-0 rounded-full transition-opacity disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-500"
    >
      <Avatar src={src} name={name} size={size} />
      <span
        style={{ width: badge, height: badge }}
        className="absolute bottom-0 right-0 grid place-items-center rounded-full border-[3px] border-cream-50 bg-sage-500 text-white"
      >
        {loading ? (
          <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Icon name="photo_camera" size={Math.round(badge * 0.5)} />
        )}
      </span>
    </button>
  );
}
