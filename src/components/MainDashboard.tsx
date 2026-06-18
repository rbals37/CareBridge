"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import { UserPlus, Settings } from "lucide-react";
import MobileShell, { MobileFooter } from "@/components/layout/MobileShell";
import RecordTab from "@/components/dashboard/RecordTab";
import ReviewTab from "@/components/dashboard/ReviewTab";
import type { ICustomField } from "@/models/Handoff";
import type { PatientInfo, StoredHandoff, UserInfo } from "@/types";

const EMPTY_HANDOFF: StoredHandoff = {
  mealAmount: "보통",
  excretionSleep: { urine: true, feces: true, sleep: true },
  mobility: "부축 시 이동 가능",
  emotion: "보통",
  medications: { morning: false, lunch: false, dinner: false, bedtime: false },
  memo: "",
  customFields: [],
};

interface MainDashboardProps {
  patient: PatientInfo;
  user: UserInfo;
}

export default function MainDashboard({ patient, user }: MainDashboardProps) {
  const [activeTab, setActiveTab] = useState<"record" | "review">("record");
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [handoff, setHandoff] = useState<StoredHandoff>(EMPTY_HANDOFF);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const dates = Array.from({ length: 14 }).map((_, i) => subDays(today, 13 - i));
  const dateKey = startOfDay(selectedDate).toISOString();
  const genderLabel = patient.gender === "male" ? "남" : "여";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const parseHandoff = (data: Record<string, unknown>): StoredHandoff => ({
    mealAmount: data.mealAmount as string | null,
    excretionSleep: data.excretionSleep as StoredHandoff["excretionSleep"],
    mobility: data.mobility as string | null,
    emotion: data.emotion as string | null,
    medications: data.medications as Record<string, boolean>,
    memo: data.memo as string,
    voiceMemoUrl: data.voiceMemoUrl as string | undefined,
    customFields: (data.customFields as StoredHandoff["customFields"]) ?? [],
    status: data.status as string,
  });

  const loadHandoff = useCallback(
    async (date: Date) => {
      const iso = startOfDay(date).toISOString();

      try {
        const params = new URLSearchParams({ date: iso, patientId: patient.id });
        const res = await fetch(`/api/handoffs?${params}`, { credentials: "include" });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          setHandoff(EMPTY_HANDOFF);
          return;
        }

        const data = await res.json();
        if (data.handoff) {
          setHandoff(parseHandoff(data.handoff));
        } else {
          setHandoff(EMPTY_HANDOFF);
        }
      } catch {
        setHandoff(EMPTY_HANDOFF);
        showToast("기록을 불러오지 못했습니다");
      }
    },
    [patient.id],
  );

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.scrollLeft = calendarRef.current.scrollWidth;
    }
  }, []);

  useEffect(() => {
    loadHandoff(selectedDate);
  }, [selectedDate, loadHandoff]);

  const persistHandoff = async (
    data: StoredHandoff,
    status: "handed_off" | "accepted",
  ) => {
    const res = await fetch("/api/handoffs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient.id,
        date: dateKey,
        status,
        mealAmount: data.mealAmount,
        excretionSleep: data.excretionSleep,
        mobility: data.mobility,
        emotion: data.emotion,
        medications: data.medications,
        memo: data.memo,
        voiceMemoUrl: data.voiceMemoUrl,
        customFields: data.customFields ?? [],
      }),
    });

    if (res.status === 401) {
      window.location.href = "/login";
      return false;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error ?? "저장에 실패했습니다");
      return false;
    }

    const result = await res.json();
    if (result.handoff) {
      setHandoff(parseHandoff(result.handoff));
    }

    showToast(status === "accepted" ? "인수 확인 완료!" : "저장 완료!");
    return true;
  };

  const handleSave = async (status: "handed_off" | "accepted") => {
    setSaving(true);
    await persistHandoff(handoff, status);
    setSaving(false);
  };

  const handleCopyFromYesterday = async () => {
    const yesterday = subDays(selectedDate, 1);
    const iso = startOfDay(yesterday).toISOString();

    try {
      const params = new URLSearchParams({ date: iso, patientId: patient.id });
      const res = await fetch(`/api/handoffs?${params}`, { credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        if (data.handoff) {
          const copied = parseHandoff(data.handoff);
          setHandoff({ ...copied, memo: "" });
          showToast("전날 기록을 불러왔습니다");
          return;
        }
      }
    } catch {
      /* ignore */
    }
    showToast("전날 기록이 없습니다");
  };

  return (
    <MobileShell
      footer={
        activeTab === "record" ? (
          <MobileFooter>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave("handed_off")}
              className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-md active:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "저장 중…" : "작성 완료 및 바톤 넘기기"}
            </button>
          </MobileFooter>
        ) : isSameDay(selectedDate, today) ? (
          <MobileFooter>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave("accepted")}
              className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-black leading-snug text-white shadow-md active:bg-teal-700 disabled:opacity-60"
            >
              모든 주의사항 확인 · 간병 인계받기
            </button>
          </MobileFooter>
        ) : undefined
      }
    >
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-teal-600 active:opacity-70">
            간병잇다
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/invite"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600"
              aria-label="초대"
            >
              <UserPlus className="h-4 w-4" />
            </Link>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
              aria-label="설정"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50 to-blue-50 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-teal-100 bg-white text-lg font-black text-teal-700">
            {patient.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black text-gray-900">
              {patient.name} 환자
            </p>
            <p className="text-xs font-bold text-teal-800">
              {patient.age}세 · {genderLabel} · {patient.room}호 {patient.bed}번
            </p>
            <p className="text-[10px] font-bold text-gray-500">
              기록자: {user.name}
            </p>
          </div>
        </div>
      </header>

      <div className="flex shrink-0 border-b border-gray-100 bg-white">
        {(
          [
            { id: "record", main: "내용 기록", sub: "인계" },
            { id: "review", main: "인수 확인", sub: "인수" },
          ] as const
        ).map(({ id, main, sub }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 border-b-[3px] py-2.5 text-center ${
              activeTab === id
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-400"
            }`}
          >
            <span className="block text-sm font-black">{main}</span>
            <span className="block text-[10px] font-bold">({sub})</span>
          </button>
        ))}
      </div>

      <div
        ref={calendarRef}
        className="shrink-0 overflow-x-auto border-b border-gray-100 bg-gray-50/80 px-3 py-2.5 no-scrollbar"
      >
        <div className="flex min-w-max gap-2">
          {dates.map((date) => {
            const selected = isSameDay(date, selectedDate);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`flex h-14 w-11 flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-95 ${
                  selected
                    ? "border-teal-600 bg-teal-600 text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                <span
                  className={`text-[10px] font-black ${selected ? "text-teal-100" : "text-gray-400"}`}
                >
                  {format(date, "E", { locale: ko })}
                </span>
                <span className="text-base font-black">{format(date, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        {activeTab === "record" ? (
          <RecordTab
            handoff={handoff}
            onChange={(updates) => setHandoff((prev) => ({ ...prev, ...updates }))}
            onAddCustomField={(field: ICustomField) =>
              setHandoff((prev) => ({
                ...prev,
                customFields: [...(prev.customFields ?? []), field],
              }))
            }
            onRemoveCustomField={(index) =>
              setHandoff((prev) => ({
                ...prev,
                customFields: (prev.customFields ?? []).filter((_, i) => i !== index),
              }))
            }
            onCopyFromYesterday={handleCopyFromYesterday}
          />
        ) : (
          <ReviewTab date={selectedDate} handoff={handoff} />
        )}
      </main>

      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-xs font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
    </MobileShell>
  );
}
