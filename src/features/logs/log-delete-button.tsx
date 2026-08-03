"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { deleteLog } from "@/features/logs/actions";

/** 기록 상세 화면 우상단의 삭제 버튼 (.pen AppBar 의 Action 슬롯) */
export function LogDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLog(id);
      setConfirming(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("삭제했어요");
      router.push("/logs");
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={`${title} 삭제`}
        onClick={() => setConfirming(true)}
        className="grid size-[38px] shrink-0 place-items-center rounded-full bg-white text-ink-800 transition-colors hover:bg-danger-bg hover:text-danger"
      >
        <Icon name="delete" size={20} />
      </button>

      <ConfirmDialog
        open={confirming}
        title="이 기록을 삭제할까요?"
        description="사진도 함께 삭제되며 되돌릴 수 없어요."
        confirmLabel="삭제"
        destructive
        loading={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
