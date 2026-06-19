"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { PatientInfo } from "@/types";

interface JoinResponse {
  patient: PatientInfo;
  alreadyJoined?: boolean;
}

interface InviteJoinFormProps {
  compact?: boolean;
  submitLabel?: string;
  onSuccess: (patient: PatientInfo, alreadyJoined?: boolean) => void;
  onError?: (message: string) => void;
}

export default function InviteJoinForm({
  compact = false,
  submitLabel = "참여하기",
  onSuccess,
  onError,
}: InviteJoinFormProps) {
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      onError?.("초대 코드를 입력해 주세요.");
      return;
    }

    setJoining(true);

    const { data, error: err } = await apiFetch<JoinResponse>("/api/invites/join", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    setJoining(false);

    if (err) {
      onError?.(err);
      return;
    }

    if (data?.patient) {
      onSuccess(data.patient, data.alreadyJoined);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="초대 코드 6자리"
          maxLength={6}
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 font-black uppercase tracking-widest outline-none focus:border-blue-500 md:py-3"
        />
        <button
          type="submit"
          disabled={joining}
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60 md:py-3"
        >
          {joining ? "참여 중…" : submitLabel}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
          초대 코드
        </label>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="6자리 코드 입력"
          maxLength={6}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-black uppercase tracking-widest outline-none focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={joining}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
      >
        <KeyRound className="h-5 w-5" />
        {joining ? "참여 중…" : submitLabel}
      </button>
    </form>
  );
}
