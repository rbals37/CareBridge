"use client";

import { useState } from "react";
import {
  CheckCircle2,
  RefreshCcw,
  Angry,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  Pill,
  Clock,
  Plus,
  X,
} from "lucide-react";
import type { ICustomField } from "@/models/Handoff";
import type { StoredHandoff } from "@/types";
import Section from "./Section";
import VoiceRecorder from "./VoiceRecorder";

const MEAL_OPTIONS = ["많음", "보통", "적음"] as const;
const MOBILITY_OPTIONS = ["혼자 이동 가능", "부축 시 이동 가능", "거동 불가"];
const EMOTIONS = [
  { value: "매우 우울", icon: Angry, selected: "border-red-500 bg-red-50 text-red-600" },
  { value: "우울", icon: Frown, selected: "border-orange-500 bg-orange-50 text-orange-600" },
  { value: "보통", icon: Meh, selected: "border-gray-500 bg-gray-50 text-gray-600" },
  { value: "긍정적", icon: Smile, selected: "border-teal-500 bg-teal-50 text-teal-600" },
  { value: "매우 긍정적", icon: SmilePlus, selected: "border-green-500 bg-green-50 text-green-600" },
] as const;

const MED_ITEMS = [
  { id: "morning", label: "아침", time: "08:00" },
  { id: "lunch", label: "점심", time: "12:00" },
  { id: "dinner", label: "저녁", time: "18:00" },
  { id: "bedtime", label: "취침 전", time: "21:00" },
] as const;

const TOGGLE_ITEMS = [
  { id: "urine", label: "소변 배출" },
  { id: "feces", label: "대변 배출" },
  { id: "sleep", label: "수면 상태" },
] as const;

interface RecordTabProps {
  handoff: StoredHandoff;
  onChange: (updates: Partial<StoredHandoff>) => void;
  onAddCustomField: (field: ICustomField) => void;
  onRemoveCustomField: (index: number) => void;
  onCopyFromYesterday: () => void;
}

export default function RecordTab({
  handoff,
  onChange,
  onAddCustomField,
  onRemoveCustomField,
  onCopyFromYesterday,
}: RecordTabProps) {
  const meal = handoff.mealAmount ?? "보통";
  const toggles = handoff.excretionSleep ?? { urine: true, feces: true, sleep: true };
  const mobility = handoff.mobility ?? "부축 시 이동 가능";
  const emotion = handoff.emotion ?? "보통";
  const medications = handoff.medications ?? {
    morning: false,
    lunch: false,
    dinner: false,
    bedtime: false,
  };
  const customFields = handoff.customFields ?? [];
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 lg:gap-y-6 lg:space-y-0">
      <button
        type="button"
        onClick={onCopyFromYesterday}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-md hover:bg-blue-700 active:bg-blue-700 lg:col-span-2"
      >
        <RefreshCcw className="h-4 w-4" />
        전날과 동일하게 기록
      </button>

      <Section title="식사량">
        <div className="grid grid-cols-3 gap-2">
          {MEAL_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ mealAmount: opt })}
              className={`rounded-xl border-2 py-3 text-sm font-black transition-all active:scale-95 ${
                meal === opt
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Section>

      <Section title="배설 및 수면">
        <div className="space-y-3">
          {TOGGLE_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-gray-800">{item.label}</span>
              <div className="flex gap-1.5">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() =>
                      onChange({
                        excretionSleep: { ...toggles, [item.id]: val },
                      })
                    }
                    className={`rounded-lg px-4 py-2 text-xs font-black border-2 ${
                      toggles[item.id as keyof typeof toggles] === val
                        ? val
                          ? "border-teal-500 bg-teal-500 text-white"
                          : "border-red-500 bg-red-500 text-white"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    {val ? "양호" : "불량"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="거동 상태">
        <div className="space-y-2">
          {MOBILITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ mobility: opt })}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-3 text-left text-sm font-black active:scale-[0.99] ${
                mobility === opt
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {opt}
              {mobility === opt && (
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section title="감정 상태">
        <div className="grid grid-cols-5 gap-1.5">
          {EMOTIONS.map(({ value, icon: Icon, selected }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ emotion: value })}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-2 ${
                emotion === value
                  ? selected
                  : "border-gray-200 text-gray-400"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[9px] font-black leading-tight text-center">
                {value.replace("매우 ", "")}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="투약 상태">
        <div className="space-y-3">
          {MED_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    medications[item.id] ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <Pill
                    className={`h-4 w-4 ${
                      medications[item.id] ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-black">{item.label} 투약</p>
                  <p className="flex items-center gap-1 text-xs font-bold text-gray-500">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() =>
                      onChange({
                        medications: { ...medications, [item.id]: val },
                      })
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-black border-2 ${
                      medications[item.id] === val
                        ? val
                          ? "border-purple-500 bg-purple-500 text-white"
                          : "border-gray-500 bg-gray-500 text-white"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    {val ? "완료" : "미완"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="커스텀 항목">
        {customFields.map((field, idx) => (
          <div
            key={idx}
            className="mb-2 flex items-center gap-2 rounded-xl border border-teal-100 bg-white px-3 py-2"
          >
            <div className="flex-1">
              <p className="text-xs font-black text-teal-700">{field.label}</p>
              <p className="text-sm font-bold">{String(field.value)}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveCustomField(idx)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="항목 (혈당)"
            className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-teal-500"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="값"
            className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onClick={() => {
              if (!newLabel.trim()) return;
              onAddCustomField({ label: newLabel.trim(), value: newValue.trim(), type: "text" });
              setNewLabel("");
              setNewValue("");
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </Section>

      <Section title="특이사항 메모" className="lg:col-span-2">
        <textarea
          value={handoff.memo ?? ""}
          onChange={(e) => onChange({ memo: e.target.value })}
          placeholder="다음 근무자에게 전달할 내용"
          className="h-28 w-full resize-none rounded-xl border-2 border-gray-200 p-3 text-sm font-bold outline-none focus:border-teal-500 md:h-36"
        />
      </Section>

      <Section title="음성 인계 (선택)" className="lg:col-span-2">
        <VoiceRecorder
          value={handoff.voiceMemoUrl}
          onChange={(url) => onChange({ voiceMemoUrl: url })}
        />
      </Section>
    </div>
  );
}
