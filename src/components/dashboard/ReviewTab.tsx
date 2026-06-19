"use client";

import {
  Mic,
  AlertTriangle,
  Info,
  Activity,
  Utensils,
  Droplets,
  FileText,
  Smile,
  Pill,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import type { StoredHandoff } from "@/types";
import {
  deriveHandoffAlerts,
  hasHandoffRecord,
} from "@/lib/handoff-alerts";
import VoiceMemoPlayer from "./VoiceMemoPlayer";

const ALERT_STYLES = {
  danger: {
    border: "border-red-500",
    bg: "bg-red-50",
    icon: "text-red-600",
    title: "text-red-900",
    message: "text-red-700",
    Icon: AlertTriangle,
  },
  warning: {
    border: "border-yellow-500",
    bg: "bg-yellow-50",
    icon: "text-yellow-700",
    title: "text-yellow-900",
    message: "text-yellow-800",
    Icon: AlertTriangle,
  },
  info: {
    border: "border-blue-500",
    bg: "bg-blue-50",
    icon: "text-blue-600",
    title: "text-blue-900",
    message: "text-blue-700",
    Icon: Info,
  },
};

export default function ReviewTab({
  date,
  handoff,
}: {
  date: Date;
  handoff: StoredHandoff;
}) {
  const saved = hasHandoffRecord(handoff);
  const alerts = deriveHandoffAlerts(handoff);

  const meal = saved ? (handoff.mealAmount ?? "—") : "—";
  const mobility = saved ? (handoff.mobility ?? "—") : "—";
  const emotion = saved ? (handoff.emotion ?? "—") : "—";
  const medications = handoff.medications ?? {};
  const completedCount = Object.values(medications).filter(Boolean).length;
  const excretionGood =
    handoff.excretionSleep?.urine !== false &&
    handoff.excretionSleep?.feces !== false &&
    handoff.excretionSleep?.sleep !== false;

  if (!saved) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-12 text-center">
        <ClipboardList className="mb-4 h-12 w-12 text-gray-300" />
        <p className="text-base font-black text-gray-700">
          {format(date, "M월 d일")} 인계 기록 없음
        </p>
        <p className="mt-2 text-xs font-bold leading-relaxed text-gray-500">
          이 날짜에 저장된 인계 기록이 없습니다.
          <br />
          인계 탭에서 기록 후 확인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {alerts.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-black text-gray-500">인계 기록 기반 주의사항</p>
          {alerts.map((alert, idx) => {
            const style = ALERT_STYLES[alert.type];
            const Icon = style.Icon;
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-r-xl border-l-4 px-4 py-3 ${style.border} ${style.bg}`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
                <div>
                  <p className={`text-sm font-black ${style.title}`}>{alert.title}</p>
                  <p className={`mt-1 text-xs font-bold leading-relaxed ${style.message}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
          <p className="text-sm font-black text-green-800">
            특별한 주의사항이 기록되지 않았습니다
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-black text-gray-900">
          <Activity className="h-5 w-5 text-teal-600" />
          {format(date, "M월 d일")} 돌봄 요약
        </h3>
        <div className="mb-3 grid grid-cols-3 gap-2 md:gap-3 lg:grid-cols-5">
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
        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-2">
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
            {handoff.memo || "기록된 메모가 없습니다."}
          </p>
        </div>
      </div>

      {handoff.voiceMemoUrl && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-base font-black">
            <Mic className="h-5 w-5 text-teal-600" />
            음성 인계
          </h3>
          <VoiceMemoPlayer src={handoff.voiceMemoUrl} />
        </div>
      )}
    </div>
  );
}
