/** 이미지 업로드 공통 규칙 (SPEC-06) */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

export const AVATAR_BUCKET = "avatars";
export const LOG_IMAGE_BUCKET = "log-images";

type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      ok: false,
      message: "이미지 파일만 올릴 수 있어요 (JPG, PNG, WebP, HEIC).",
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const sizeMb = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      message: `5MB 이하 이미지를 선택해 주세요. (현재 ${sizeMb}MB)`,
    };
  }

  return { ok: true };
}

/** 원본 파일명은 쓰지 않는다 — 한글·공백·중복 문제를 피하기 위해 새로 만든다. */
export function buildObjectPath(userId: string, file: File) {
  const extension = extensionFor(file.type);
  const unique = crypto.randomUUID().slice(0, 8);
  return `${userId}/${Date.now()}-${unique}.${extension}`;
}

function extensionFor(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    default:
      return "jpg";
  }
}

/**
 * 공개 URL에서 Storage 오브젝트 경로를 역산한다.
 * 이미지 교체·삭제 시 이전 파일을 지우는 데 사용한다.
 * 형태: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
 *
 * 호스트를 검증해 다른 도메인 URL에 같은 경로 문자열을 심어 경로를 유도하는 것을 막고,
 * 쿼리/해시를 제외한 pathname 만 사용한다. 잘못된 인코딩이 와도 throw 하지 않는다.
 * (Storage RLS 가 본인 폴더만 허용하므로 실제 피해는 없지만, 방어를 코드에도 둔다.)
 */
export function objectPathFromPublicUrl(
  publicUrl: string,
  bucket: string,
): string | null {
  let url: URL;
  try {
    url = new URL(publicUrl);
  } catch {
    return null;
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (base) {
    try {
      if (url.origin !== new URL(base).origin) return null;
    } catch {
      return null;
    }
  }

  const marker = `/storage/v1/object/public/${bucket}/`;
  if (!url.pathname.startsWith(marker)) return null;

  try {
    return decodeURIComponent(url.pathname.slice(marker.length));
  } catch {
    return null;
  }
}
