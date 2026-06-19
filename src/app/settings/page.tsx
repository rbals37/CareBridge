"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, User, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ErrorAlert from "@/components/ui/ErrorAlert";
import AppPage, { AppPageHeader, AppPageMain } from "@/components/layout/AppPage";
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
    <AppPage>
      <AppPageHeader>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-black md:text-lg">설정</h1>
        </div>
      </AppPageHeader>

      <AppPageMain>
        {error && <ErrorAlert message={error} />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-800 md:text-base">
              <User className="h-4 w-4 text-teal-600" />
              내 계정
            </h2>
            <p className="text-base font-black md:text-lg">{user.name}</p>
            <p className="text-sm font-bold text-gray-500">{user.email}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-800 md:text-base">
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
                    className="block rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-teal-50 md:py-2.5"
                  >
                    {p.name} · {p.room}호 {p.bed}번
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/register"
              className="mt-3 inline-block text-xs font-black text-teal-600 hover:text-teal-700 md:text-sm"
            >
              + 새 환자 등록
            </Link>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3.5 text-sm font-black text-red-600 hover:bg-red-100 disabled:opacity-60 md:py-4 md:text-base"
            >
              <LogOut className="h-5 w-5" />
              {loggingOut ? "로그아웃 중…" : "로그아웃"}
            </button>
          </div>
        </div>
      </AppPageMain>
    </AppPage>
  );
}
