"use client";

import {
  Mic,
  Play,
  AlertTriangle,
  Info,
  Activity,
  Utensils,
  Droplets,
  FileText,
  Smile,
  Pill,
} from "lucide-react";
import { format } from "date-fns";
import type { StoredHandoff } from "@/lib/client-storage";

export default function ReviewTab({
  date,
  handoff,
}: {
  date: Date;
  handoff: StoredHandoff;
}) {
  const meal = handoff.mealAmount ?? "보통";
  const mobility = handoff.mobility ?? "부축 시 이동";
  const emotion = handoff.emotion ?? "보통";
  const medications = handoff.medications ?? {};
  const completedCount = Object.values(medications).filter(Boolean).length;
  const excretionGood =
    handoff.excretionSleep?.urine !== false &&
    handoff.excretionSleep?.feces !== false &&
    handoff.excretionSleep?.sleep !== false;

  return (
    <div className="space-y-4 pb-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-r-xl border-l-4 border-red-500 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-black text-red-900">낙상 고위험!</p>
            <p className="mt-1 text-xs font-bold leading-relaxed text-red-700">
              화장실 이동 시 반드시 부축 및 휠체어 사용
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-r-xl border-l-4 border-yellow-500 bg-yellow-50 px-4 py-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-yellow-700" />
          <div>
            <p className="text-sm font-black text-yellow-900">자정 이후 금식</p>
            <p className="mt-1 text-xs font-bold leading-relaxed text-yellow-800">
              내일 오전 검사를 위해 금식이 필요합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-black text-gray-900">
          <Activity className="h-5 w-5 text-teal-600" />
          {format(date, "M월 d일")} 돌봄 요약
        </h3>
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-xl border border-orange-100 bg-orange-50 p-2">
            <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-200 text-orange-700">
              <Utensils className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black text-gray-500">식사량</span>
            <span className="text-xs font-black">{meal}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-blue-100 bg-blue-50 p-2">
            <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-blue-200 text-blue-700">
              <Droplets className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black text-gray-500">배설/수면</span>
            <span className="text-xs font-black">{excretionGood ? "양호" : "주의"}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-red-100 bg-red-50 p-2">
            <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-red-200 text-red-700">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black text-gray-500">거동</span>
            <span className="text-xs font-black">{mobility.slice(0, 5)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center rounded-xl border border-teal-100 bg-teal-50 p-2">
            <Smile className="mb-1 h-5 w-5 text-teal-600" />
            <span className="text-[10px] font-black text-gray-500">감정</span>
            <span className="text-xs font-black">{emotion}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-purple-100 bg-purple-50 p-2">
            <Pill className="mb-1 h-5 w-5 text-purple-600" />
            <span className="text-[10px] font-black text-gray-500">투약</span>
            <span className="text-xs font-black">{completedCount}회 완료</span>
          </div>
        </div>
      </div>

      {handoff.customFields && handoff.customFields.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-base font-black">커스텀 항목</h3>
          <div className="space-y-2">
            {handoff.customFields.map((field, idx) => (
              <div
                key={idx}
                className="flex justify-between rounded-xl border border-teal-100 bg-teal-50 px-3 py-2"
              >
                <span className="text-sm font-black text-teal-800">{field.label}</span>
                <span className="text-sm font-bold">{String(field.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-black">
          <FileText className="h-5 w-5 text-teal-600" />
          특이사항 메모
        </h3>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-sm font-bold leading-relaxed text-gray-800">
            {handoff.memo || "아직 기록된 메모가 없습니다."}
          </p>
        </div>
      </div>

      {handoff.voiceMemoUrl && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-base font-black">
            <Mic className="h-5 w-5 text-teal-600" />
            음성 인계
          </h3>
          <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white"
            >
              <Play className="ml-0.5 h-5 w-5" />
            </button>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-1/3 rounded-full bg-teal-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
