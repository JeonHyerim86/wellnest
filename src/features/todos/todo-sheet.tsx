"use client";

import { useState, useTransition } from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { TextArea, TextField } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createTodo, deleteTodo, updateTodo } from "@/features/todos/actions";
import { todayInSeoul } from "@/lib/date";
import type { Priority, Todo } from "@/lib/supabase/types";

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "낮음" },
  { value: "normal", label: "보통" },
  { value: "high", label: "높음" },
];

const TITLE_MAX = 120;
const MEMO_MAX = 500;

/**
 * 부모가 열릴 때만 마운트한다 (`{open && <TodoSheet key=... />}`).
 * 그래서 초기값 동기화를 위한 useEffect가 필요 없다.
 */
export function TodoSheet({
  onClose,
  todo,
  defaultDate,
}: {
  onClose: () => void;
  /** 있으면 수정 모드, 없으면 생성 모드 */
  todo?: Todo | null;
  defaultDate?: string;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState(todo?.title ?? "");
  const [memo, setMemo] = useState(todo?.memo ?? "");
  const [dueDate, setDueDate] = useState(
    todo?.due_date ?? defaultDate ?? todayInSeoul(),
  );
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? "normal");
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(todo);
  const canSubmit = title.trim().length > 0 && !pending;

  function handleSubmit() {
    if (!canSubmit) return;

    startTransition(async () => {
      const input = { title, memo, dueDate, priority };
      const result = isEdit
        ? await updateTodo(todo!.id, input)
        : await createTodo(input);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      toast.success(isEdit ? "수정했어요" : "할 일을 추가했어요");
      onClose();
    });
  }

  function handleDelete() {
    if (!todo) return;

    startTransition(async () => {
      const result = await deleteTodo(todo.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast.success("삭제했어요");
      onClose();
    });
  }

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={isEdit ? "할 일 수정" : "할 일 추가"}
    >
      <div className="flex flex-col gap-4">
        <TextField
          id="todo-title"
          label="할 일"
          placeholder="무엇을 해볼까요?"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(event) => {
            setTitle(event.target.value);
            setError(null);
          }}
          counter={`${title.length}/${TITLE_MAX}`}
          error={error && !title.trim() ? "할 일 제목을 입력해 주세요." : undefined}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-label text-ink-700">우선순위</span>
          <div className="flex gap-2">
            {PRIORITIES.map((option) => (
              <Chip
                key={option.value}
                tone="sage"
                selected={priority === option.value}
                onClick={() => setPriority(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <TextField
          id="todo-date"
          label="날짜"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />

        <TextArea
          id="todo-memo"
          label="메모 (선택)"
          placeholder="기억해둘 내용이 있나요?"
          value={memo}
          maxLength={MEMO_MAX}
          onChange={(event) => setMemo(event.target.value)}
          counter={`${memo.length}/${MEMO_MAX}`}
        />

        {error && title.trim() && (
          <p role="alert" className="rounded-field bg-danger-bg px-3 py-2 text-caption text-danger">
            {error}
          </p>
        )}

        {deleting ? (
          <div className="flex flex-col gap-2 rounded-field bg-danger-bg p-3">
            <p className="text-caption text-danger">
              &lsquo;{todo?.title}&rsquo;을(를) 삭제할까요? 되돌릴 수 없어요.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setDeleting(false)}>
                취소
              </Button>
              <Button variant="danger" fullWidth loading={pending} onClick={handleDelete}>
                삭제
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-1">
            {isEdit && (
              <Button variant="danger" size="lg" onClick={() => setDeleting(true)}>
                삭제
              </Button>
            )}
            <Button
              size="lg"
              fullWidth
              loading={pending}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              저장
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
