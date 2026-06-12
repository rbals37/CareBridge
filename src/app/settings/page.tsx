"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, User, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import type { PatientInfo, UserInfo } from "@/types";

interface MeResponse {
  user: UserInfo;
  patient: PatientInfo | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiFetch<MeResponse>("/api/auth/me").then(({ data, status }) => {
      if (status === 401 || !data) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setPatient(data.patient);
    });
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  if (!user) return <LoadingScreen />;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg active:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-black">설정</h1>
      </header>

      <div className="flex-1 space-y-4 p-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-800">
            <User className="h-4 w-4 text-teal-600" />
            내 계정
          </h2>
          <p className="text-base font-black">{user.name}</p>
          <p className="text-sm font-bold text-gray-500">{user.email}</p>
        </div>

        {patient && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-800">
              <Heart className="h-4 w-4 text-teal-600" />
              담당 환자
            </h2>
            <p className="text-base font-black">{patient.name} 환자</p>
            <p className="text-sm font-bold text-gray-500">
              {patient.age}세 · {patient.gender === "male" ? "남" : "여"} ·{" "}
              {patient.room}호 {patient.bed}번
            </p>
            <Link
              href="/register"
              className="mt-3 inline-block text-xs font-black text-teal-600"
            >
              + 새 환자 등록
            </Link>
          </div>
        )}

        <button
          type="button"
          disabled={loggingOut}
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3.5 text-sm font-black text-red-600 active:bg-red-100 disabled:opacity-60"
        >
          <LogOut className="h-5 w-5" />
          {loggingOut ? "로그아웃 중…" : "로그아웃"}
        </button>
      </div>
    </div>
  );
}
