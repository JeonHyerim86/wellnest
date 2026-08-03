"use client";

import { useState, useTransition } from "react";

import { Card, SectionHeader } from "@/components/ui/card";
import { CheckCircle } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/feedback";
import { Icon, type IconName } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { toggleTodo } from "@/features/todos/actions";
import { TodoSheet } from "@/features/todos/todo-sheet";
import { cn } from "@/lib/cn";
import type { Todo } from "@/lib/supabase/types";

/**
 * .pen 03. Components > Priority Badge
 * 세 단계 모두 항상 표시한다. "보통"만 숨기면 우선순위가 없는 것처럼 보인다.
 */
const PRIORITY_BADGE: Record<
  Todo["priority"],
  { label: string; icon: IconName; className: string }
> = {
  high: {
    label: "높음",
    icon: "priority_high",
    className: "bg-danger-bg text-danger",
  },
  normal: {
    label: "보통",
    icon: "remove",
    className: "bg-cream-100 text-ink-500",
  },
  low: {
    label: "낮음",
    icon: "keyboard_arrow_down",
    className: "bg-cream-100 text-ink-400",
  },
};

export function TodayTodos({
  todos,
  today,
}: {
  todos: Todo[];
  today: string;
}) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  // 낙관적 UI — 서버 응답 전에 체크 상태를 먼저 반영한다.
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  function isDone(todo: Todo) {
    return optimistic[todo.id] ?? todo.is_done;
  }

  function handleToggle(todo: Todo) {
    const next = !isDone(todo);
    setOptimistic((prev) => ({ ...prev, [todo.id]: next }));
    setBusy((prev) => ({ ...prev, [todo.id]: true }));

    startTransition(async () => {
      const result = await toggleTodo(todo.id, next);
      setBusy((prev) => ({ ...prev, [todo.id]: false }));

      if (!result.ok) {
        // 실패 시 롤백
        setOptimistic((prev) => {
          const copy = { ...prev };
          delete copy[todo.id];
          return copy;
        });
        toast.error(result.message);
      }
    });
  }

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(todo: Todo) {
    setEditing(todo);
    setSheetOpen(true);
  }

  return (
    <section>
      <SectionHeader
        title="오늘 할 일"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full px-2 py-1 text-label font-medium text-sage-600 hover:bg-sage-50"
          >
            + 추가
          </button>
        }
      />

      {todos.length === 0 ? (
        <EmptyState emoji="📝" title="오늘 할 일이 없어요" description="지금 하나 추가해 볼까요?" />
      ) : (
        <Card className="divide-y divide-cream-200 overflow-hidden">
          {todos.map((todo) => {
            const done = isDone(todo);
            return (
              <div key={todo.id} className="flex items-center gap-1 pr-3">
                <CheckCircle
                  checked={done}
                  disabled={busy[todo.id]}
                  onToggle={() => handleToggle(todo)}
                  label={`${todo.title} ${done ? "완료 해제" : "완료"}`}
                />
                <button
                  type="button"
                  onClick={() => openEdit(todo)}
                  className="flex min-w-0 flex-1 flex-col items-start py-3 text-left"
                >
                  <span className="flex w-full items-center gap-1.5">
                    <span
                      className={cn(
                        "truncate text-body",
                        done ? "text-ink-400 line-through" : "text-ink-800",
                      )}
                    >
                      {todo.title}
                    </span>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-[3px] rounded-full py-[3px] pl-[7px] pr-[9px] text-overline",
                        PRIORITY_BADGE[todo.priority].className,
                      )}
                    >
                      <Icon
                        name={PRIORITY_BADGE[todo.priority].icon}
                        size={12}
                        weight={700}
                      />
                      {PRIORITY_BADGE[todo.priority].label}
                    </span>
                  </span>
                  {todo.memo && (
                    <span className="mt-0.5 line-clamp-1 text-caption text-ink-500">
                      {todo.memo}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {sheetOpen && (
        <TodoSheet
          key={editing?.id ?? "new"}
          onClose={() => setSheetOpen(false)}
          todo={editing}
          defaultDate={today}
        />
      )}
    </section>
  );
}
