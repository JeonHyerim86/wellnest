import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildObjectPath,
  objectPathFromPublicUrl,
  validateImageFile,
} from "@/lib/storage";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string };

/** 파일을 Storage에 올리고 공개 URL을 돌려준다 (SPEC-06 §3.1). */
export async function uploadImage(
  supabase: Client,
  bucket: string,
  userId: string,
  file: File,
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.ok) return { ok: false, message: validation.message };

  const path = buildObjectPath(userId, file);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) {
    console.error(`[uploadImage:${bucket}]`, error.message);
    return { ok: false, message: "이미지 업로드에 실패했어요. 다시 시도해 주세요." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { ok: true, url: publicUrl, path };
}

/**
 * 업로드는 됐는데 DB 저장이 실패한 경우의 롤백 (SPEC-06 E4).
 * 고아 파일이 Storage에 남지 않도록 정리한다.
 */
export async function removeObjectByPath(
  supabase: Client,
  bucket: string,
  path: string,
) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    // E5: 삭제 실패는 사용자 흐름을 막지 않는다. 경고만 남긴다.
    console.warn(`[removeObject:${bucket}] ${path}: ${error.message}`);
  }
}

/** 공개 URL을 받아 해당 파일을 정리한다 (교체·삭제 시 이전 파일 제거). */
export async function removeObjectByUrl(
  supabase: Client,
  bucket: string,
  publicUrl: string | null | undefined,
) {
  if (!publicUrl) return;
  const path = objectPathFromPublicUrl(publicUrl, bucket);
  if (!path) return;
  await removeObjectByPath(supabase, bucket, path);
}
