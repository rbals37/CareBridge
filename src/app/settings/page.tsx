"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, User, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ErrorAlert from "@/components/ui/ErrorAlert";
import type { PatientInfo, UserInfo } from "@/types";

interface MeResponse {
  user: UserInfo;
  patient: PatientInfo | null;
}

interface PatientsResponse {
  patients: PatientInfo[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const me = await apiFetch<MeResponse>("/api/auth/me");
      if (me.status === 401 || !me.data) {
        router.replace("/login");
        return;
      }
      setUser(me.data.user);

      const list = await apiFetch<PatientsResponse>("/api/patients");
      if (list.data?.patients) {
        setPatients(list.data.patients);
      }
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");
    const { error: err } = await apiFetch("/api/auth/logout", { method: "POST" });
    setLoggingOut(false);

    if (err) {
      setError(err);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  if (!user) return <LoadingScreen />;

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-gray-50">
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
        {error && <ErrorAlert message={error} />}

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-800">
            <User className="h-4 w-4 text-teal-600" />
            내 계정
          </h2>
          <p className="text-base font-black">{user.name}</p>
          <p className="text-sm font-bold text-gray-500">{user.email}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-800">
            <Heart className="h-4 w-4 text-teal-600" />
            등록 환자 ({patients.length})
          </h2>
          {patients.length === 0 ? (
            <p className="text-sm font-bold text-gray-500">등록된 환자가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {patients.map((p) => (
                <Link
                  key={p.id}
                  href={`/care/${p.id}`}
                  className="block rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800 active:bg-teal-50"
                >
                  {p.name} · {p.room}호 {p.bed}번
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/register"
            className="mt-3 inline-block text-xs font-black text-teal-600"
          >
            + 새 환자 등록
          </Link>
        </div>

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
