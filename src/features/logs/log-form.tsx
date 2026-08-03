"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextArea, TextField } from "@/components/ui/field";
import { ImagePicker } from "@/components/ui/image-picker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { createLog, deleteLog, updateLog } from "@/features/logs/actions";
import { MEAL_TYPE_LABEL } from "@/features/logs/log-card";
import { todayInSeoul } from "@/lib/date";
import type { LogType, MealType, WellnessLog } from "@/lib/supabase/types";

const MEAL_TYPES = Object.keys(MEAL_TYPE_LABEL) as MealType[];
const TITLE_MAX = 120;
const MEMO_MAX = 500;

export function LogForm({ log }: { log?: WellnessLog | null }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [logType, setLogType] = useState<LogType>(log?.log_type ?? "meal");
  const [loggedOn, setLoggedOn] = useState(log?.logged_on ?? todayInSeoul());
  const [title, setTitle] = useState(log?.title ?? "");
  const [memo, setMemo] = useState(log?.memo ?? "");
  const [mealType, setMealType] = useState<MealType | null>(log?.meal_type ?? null);
  const [calories, setCalories] = useState(log?.calories?.toString() ?? "");
  const [durationMin, setDurationMin] = useState(
    log?.duration_min?.toString() ?? "",
  );
  const [image, setImage] = useState<{ file: File | null; removed: boolean }>({
    file: null,
    removed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEdit = Boolean(log);
  const canSubmit = title.trim().length > 0 && !pending;

  function handleSubmit() {
    if (!canSubmit) return;

    const formData = new FormData();
    formData.set("logType", logType);
    formData.set("loggedOn", loggedOn);
    formData.set("title", title);
    formData.set("memo", memo);

    // 타입에 맞지 않는 필드는 아예 보내지 않아 서버 정규화와 어긋나지 않게 한다.
    if (logType === "meal") {
      if (mealType) formData.set("mealType", mealType);
      formData.set("calories", calories);
    } else {
      formData.set("durationMin", durationMin);
    }

    if (image.file) formData.set("image", image.file);
    if (image.removed) formData.set("removeImage", "1");

    startTransition(async () => {
      const result = isEdit
        ? await updateLog(log!.id, formData)
        : await createLog(formData);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      toast.success(isEdit ? "수정했어요" : "기록을 남겼어요");
      router.push("/logs");
    });
  }

  function handleDelete() {
    if (!log) return;

    startTransition(async () => {
      const result = await deleteLog(log.id);
      setConfirmingDelete(false);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      toast.success("삭제했어요");
      router.push("/logs");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl
        value={logType}
        onChange={(next) => {
          setLogType(next);
          setError(null);
        }}
        options={[
          { value: "meal", label: "🍽 식단" },
          { value: "workout", label: "🏃 운동" },
        ]}
      />

      <TextField
        id="log-title"
        label={logType === "meal" ? "무엇을 먹었나요?" : "어떤 운동을 했나요?"}
        placeholder={logType === "meal" ? "예: 오트밀과 바나나" : "예: 하체 + 러닝"}
        value={title}
        maxLength={TITLE_MAX}
        onChange={(event) => {
          setTitle(event.target.value);
          setError(null);
        }}
        counter={`${title.length}/${TITLE_MAX}`}
      />

      {logType === "meal" ? (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-label text-ink-700">식사 종류</span>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((type) => (
                <Chip
                  key={type}
                  tone="meal"
                  selected={mealType === type}
                  onClick={() => setMealType(mealType === type ? null : type)}
                >
                  {MEAL_TYPE_LABEL[type]}
                </Chip>
              ))}
            </div>
          </div>

          <TextField
            id="log-calories"
            label="칼로리 (선택)"
            type="number"
            inputMode="numeric"
            min={0}
            max={10000}
            placeholder="예: 320"
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
            hint="kcal 단위로 입력해 주세요"
          />
        </>
      ) : (
        <TextField
          id="log-duration"
          label="운동 시간 (선택)"
          type="number"
          inputMode="numeric"
          min={0}
          max={1440}
          placeholder="예: 55"
          value={durationMin}
          onChange={(event) => setDurationMin(event.target.value)}
          hint="분 단위로 입력해 주세요"
        />
      )}

      <TextField
        id="log-date"
        label="날짜"
        type="date"
        value={loggedOn}
        max={todayInSeoul()}
        onChange={(event) => setLoggedOn(event.target.value)}
      />

      <ImagePicker initialUrl={log?.image_url} onChange={setImage} />

      <TextArea
        id="log-memo"
        label="메모 (선택)"
        placeholder="오늘의 컨디션은 어땠나요?"
        value={memo}
        maxLength={MEMO_MAX}
        onChange={(event) => setMemo(event.target.value)}
        counter={`${memo.length}/${MEMO_MAX}`}
      />

      {error && (
        <p role="alert" className="rounded-field bg-danger-bg px-3 py-2.5 text-caption text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-2 pb-4">
        {isEdit && (
          <Button
            variant="danger"
            size="lg"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending}
          >
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

      <ConfirmDialog
        open={confirmingDelete}
        title="이 기록을 삭제할까요?"
        description="사진도 함께 삭제되며 되돌릴 수 없어요."
        confirmLabel="삭제"
        destructive
        loading={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
