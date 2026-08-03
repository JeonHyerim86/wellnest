"use client";

import { useRef, useState, useTransition } from "react";

import { AvatarEditable } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  removeAvatar,
  signOut,
  updateAvatar,
  updateDisplayName,
} from "@/features/profile/actions";
import { validateImageFile } from "@/lib/storage";

const NAME_MAX = 20;

export function ProfilePanel({
  displayName,
  email,
  avatarUrl,
  joinedDays,
}: {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  /** 가입 후 경과 일수 (.pen 의 "N일째 함께하는 중" 배지) */
  joinedDays: number;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [error, setError] = useState<string | null>(null);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [uploading, setUploading] = useState(false);

  function handleSaveName() {
    if (!name.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    startTransition(async () => {
      const result = await updateDisplayName(name);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(null);
      setEditing(false);
      toast.success("수정했어요");
    });
  }

  function handleAvatarSelect(file: File | undefined) {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.ok) {
      toast.error(validation.message);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.set("avatar", file);
    setUploading(true);

    startTransition(async () => {
      const result = await updateAvatar(formData);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";

      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("프로필 사진을 변경했어요");
    });
  }

  function handleRemoveAvatar() {
    startTransition(async () => {
      const result = await removeAvatar();
      setConfirmingRemove(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("기본 이미지로 되돌렸어요");
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-2">
        <AvatarEditable
          src={avatarUrl}
          name={displayName}
          size={88}
          loading={uploading}
          onClick={() => fileRef.current?.click()}
        />

        {/* .pen Screen · Profile 의 PhotoActions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-full bg-cream-100 px-3.5 py-[7px] text-ink-500 transition-colors hover:bg-cream-200 disabled:opacity-60"
          >
            <Icon name="photo_camera" size={14} />
            <span className="text-caption font-bold">사진 변경</span>
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-full bg-danger-bg px-3.5 py-[7px] text-danger transition-colors hover:brightness-95 disabled:opacity-60"
            >
              <Icon name="delete" size={14} />
              <span className="text-caption font-bold">기본 이미지로</span>
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={(event) => handleAvatarSelect(event.target.files?.[0])}
        />
        <div className="text-center">
          <p className="text-title text-ink-800">{displayName}</p>
          <p className="text-caption text-ink-400">{email}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1.5">
          <Icon name="eco" size={14} className="text-sage-600" />
          <span className="text-[11px] font-bold text-sage-600">
            {joinedDays}일째 함께하는 중
          </span>
        </span>
      </div>

      <Card className="rounded-card px-[18px] py-1">
        {editing ? (
          <div className="flex flex-col gap-3">
            <TextField
              id="profile-name"
              label="닉네임"
              value={name}
              maxLength={NAME_MAX}
              autoFocus
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              counter={`${name.length}/${NAME_MAX}`}
              error={error ?? undefined}
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setName(displayName);
                  setError(null);
                  setEditing(false);
                }}
              >
                취소
              </Button>
              <Button
                fullWidth
                loading={pending}
                disabled={!name.trim()}
                onClick={handleSaveName}
              >
                저장
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex w-full items-center gap-3 py-3.5"
            >
              <Icon name="badge" size={19} className="text-ink-400" />
              <span className="flex-1 text-left text-label font-bold text-ink-800">
                닉네임
              </span>
              <span className="text-caption text-ink-400">{displayName}</span>
              <Icon name="chevron_right" size={17} className="text-ink-400" />
            </button>

            <div className="flex w-full items-center gap-3 border-t border-cream-200 py-3.5">
              <Icon name="info" size={19} className="text-ink-400" />
              <span className="flex-1 text-label font-bold text-ink-800">
                앱 정보
              </span>
              <span className="text-caption text-ink-400">v1.0.0</span>
            </div>
          </div>
        )}
      </Card>

      <Button
        variant="ghost"
        size="lg"
        fullWidth
        onClick={() => setConfirmingSignOut(true)}
        className="text-ink-500"
      >
        로그아웃
      </Button>

      <ConfirmDialog
        open={confirmingRemove}
        title="기본 이미지로 되돌릴까요?"
        description="업로드한 프로필 사진이 삭제되며 되돌릴 수 없어요."
        confirmLabel="삭제"
        destructive
        loading={pending}
        onConfirm={handleRemoveAvatar}
        onCancel={() => setConfirmingRemove(false)}
      />

      <ConfirmDialog
        open={confirmingSignOut}
        title="로그아웃할까요?"
        confirmLabel="로그아웃"
        loading={pending}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmingSignOut(false)}
      />
    </div>
  );
}
