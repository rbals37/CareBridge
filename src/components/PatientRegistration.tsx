"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, UserPlus, KeyRound } from "lucide-react";
import PatientForm from "@/components/PatientForm";
import InviteJoinForm from "@/components/InviteJoinForm";
import ErrorAlert from "@/components/ui/ErrorAlert";
import LoadingScreen from "@/components/ui/LoadingScreen";
import AppPage, { AppPageHeader, AppPageMain } from "@/components/layout/AppPage";
import type { PatientInfo } from "@/types";

type RegisterMode = "create" | "join";

function PatientRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "join" ? "join" : "create";
  const [mode, setMode] = useState<RegisterMode>(initialMode);
  const [error, setError] = useState("");

  const handleCreateSuccess = (patient: PatientInfo) => {
    router.push(`/care/${patient.id}`);
    router.refresh();
  };

  const handleJoinSuccess = (patient: PatientInfo) => {
    router.push(`/care/${patient.id}`);
    router.refresh();
  };

  if (mode === "create") {
    return (
      <PatientForm
        mode="create"
        title="간병 시작하기"
        subtitle="환자 정보 등록"
        submitLabel="등록 완료 및 간병 시작"
        onSuccess={handleCreateSuccess}
        headerExtra={
          <ModeTabs mode={mode} onChange={setMode} />
        }
      />
    );
  }

  return (
    <AppPage variant="form">
      <AppPageHeader>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-base font-black text-gray-900 md:text-lg">간병 시작하기</h1>
            <p className="text-xs font-bold text-gray-500 md:text-sm">초대 코드로 참여</p>
          </div>
        </div>
        <ModeTabs mode={mode} onChange={setMode} />
      </AppPageHeader>

      <AppPageMain className="pb-28 md:pb-8">
        <div className="mb-4 flex items-start gap-3 rounded-r-xl border-l-4 border-blue-500 bg-blue-50 p-4 md:mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <KeyRound className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-blue-900 md:text-base">
              초대 코드를 입력해 주세요
            </p>
            <p className="mt-1 text-xs font-bold leading-relaxed text-blue-800 md:text-sm">
              다른 간병인에게 받은 6자리 코드로 환자 기록에 참여할 수 있습니다.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <InviteJoinForm
            onSuccess={handleJoinSuccess}
            onError={setError}
            submitLabel="참여하고 간병 시작"
          />
        </div>
      </AppPageMain>
    </AppPage>
  );
}

function ModeTabs({
  mode,
  onChange,
}: {
  mode: RegisterMode;
  onChange: (mode: RegisterMode) => void;
}) {
  return (
    <div className="mt-3 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
      <button
        type="button"
        onClick={() => onChange("create")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black transition-colors md:text-sm ${
          mode === "create"
            ? "bg-white text-teal-700 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <UserPlus className="h-4 w-4" />
        새 환자 등록
      </button>
      <button
        type="button"
        onClick={() => onChange("join")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black transition-colors md:text-sm ${
          mode === "join"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <KeyRound className="h-4 w-4" />
        초대 코드
      </button>
    </div>
  );
}

export default function PatientRegistration() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PatientRegistrationContent />
    </Suspense>
  );
}
