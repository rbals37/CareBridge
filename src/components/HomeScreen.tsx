"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Settings,
  UserPlus,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
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

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError("");
      const [me, list] = await Promise.all([
        apiFetch<MeResponse>("/api/auth/me"),
        apiFetch<PatientsResponse>("/api/patients"),
      ]);

      if (me.status === 401 || me.error) {
        router.replace("/login");
        return;
      }

      if (!me.data?.user) {
        router.replace("/login");
        return;
      }

      setUser(me.data.user);

      if (list.error) {
        setError(list.error);
      } else {
        setPatients(list.data?.patients ?? []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  const handleSelectPatient = async (patientId: string) => {
    setSelectingId(patientId);
    const { error: err } = await apiFetch(`/api/patients/${patientId}/select`, {
      method: "POST",
    });
    setSelectingId(null);

    if (err) {
      setError(err);
      return;
    }

    router.push(`/care/${patientId}`);
  };

  if (loading) return <LoadingScreen />;

  return (
    <AppPage>
      <AppPageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 md:h-10 md:w-10">
              <Heart className="h-5 w-5 fill-white text-white md:h-6 md:w-6" />
            </div>
            <h1 className="text-xl font-black text-teal-600 md:text-2xl">간병잇다</h1>
          </div>
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 md:h-10 md:w-10"
            aria-label="설정"
          >
            <Settings className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </div>

        {user && (
          <p className="mt-4 text-sm font-bold text-gray-600 md:text-base">
            <span className="font-black text-gray-900">{user.name}</span>님, 안녕하세요
          </p>
        )}
      </AppPageHeader>

      <AppPageMain>
        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        <div className="mb-4 flex items-center justify-between md:mb-6">
          <h2 className="text-base font-black text-gray-900 md:text-lg">담당 환자</h2>
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-black text-teal-700 md:text-sm">
            {patients.length}명
          </span>
        </div>

        {patients.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-teal-200 bg-white px-6 py-12 text-center md:py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 md:h-20 md:w-20">
              <ClipboardList className="h-8 w-8 text-teal-600 md:h-10 md:w-10" />
            </div>
            <p className="text-base font-black text-gray-800 md:text-lg">
              등록된 환자가 없습니다
            </p>
            <p className="mt-2 text-xs font-bold leading-relaxed text-gray-500 md:text-sm">
              환자를 등록하면 간병 인수인계 기록을 시작할 수 있습니다.
            </p>
            <Link
              href="/register"
              className="mt-6 flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-black text-white shadow-md hover:bg-teal-700 md:px-8 md:py-4 md:text-base"
            >
              <UserPlus className="h-5 w-5" />
              첫 환자 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {patients.map((patient) => {
              const gender = patient.gender === "male" ? "남" : "여";
              const isSelecting = selectingId === patient.id;

              return (
                <button
                  key={patient.id}
                  type="button"
                  disabled={!!selectingId}
                  onClick={() => handleSelectPatient(patient.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-teal-200 hover:shadow-md active:scale-[0.99] disabled:opacity-60 md:p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-teal-100 bg-teal-50 text-lg font-black text-teal-700 md:h-14 md:w-14">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black text-gray-900 md:text-lg">
                      {patient.name} 환자
                    </p>
                    <p className="text-xs font-bold text-gray-500 md:text-sm">
                      {patient.age}세 · {gender} · {patient.room}호 {patient.bed}번
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-teal-600 md:text-xs">
                      {isSelecting ? "이동 중…" : "기록하기"}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              );
            })}

            <Link
              href="/register"
              className="flex min-h-[88px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal-400 bg-white py-3.5 text-sm font-black text-teal-700 hover:bg-teal-50 sm:col-span-2 xl:col-span-3 md:py-4 md:text-base"
            >
              <UserPlus className="h-5 w-5" />
              새 환자 등록
            </Link>
          </div>
        )}
      </AppPageMain>
    </AppPage>
  );
}
