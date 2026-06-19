"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Copy,
  Share2,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ErrorAlert from "@/components/ui/ErrorAlert";
import InviteJoinForm from "@/components/InviteJoinForm";
import AppPage, { AppPageHeader, AppPageMain } from "@/components/layout/AppPage";
import { formatBedLabel, formatRoomLabel } from "@/lib/patient-utils";
import type { PatientInfo } from "@/types";

interface PatientsResponse {
  patients: PatientInfo[];
}

interface InviteResponse {
  inviteCode: string;
  patient: PatientInfo;
}

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("patientId");

  const [ownedPatients, setOwnedPatients] = useState<PatientInfo[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedId ?? "");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    async function load() {
      const list = await apiFetch<PatientsResponse>("/api/patients");
      if (list.status === 401) {
        router.replace("/login");
        return;
      }

      const owned = (list.data?.patients ?? []).filter((p) => p.isOwner);
      setOwnedPatients(owned);

      const initialId =
        preselectedId && owned.some((p) => p.id === preselectedId)
          ? preselectedId
          : owned[0]?.id ?? "";

      setSelectedPatientId(initialId);

      if (initialId) {
        const invite = await apiFetch<InviteResponse>(
          `/api/patients/${initialId}/invite`,
        );
        if (invite.data?.inviteCode) {
          setInviteCode(invite.data.inviteCode);
        }
      }

      setLoading(false);
    }

    load();
  }, [preselectedId, router]);

  const handlePatientChange = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setInviteCode(null);
    setError("");

    if (!patientId) return;

    const invite = await apiFetch<InviteResponse>(`/api/patients/${patientId}/invite`);
    if (invite.data?.inviteCode) {
      setInviteCode(invite.data.inviteCode);
    }
  };

  const handleGenerate = async (regenerate = false) => {
    if (!selectedPatientId) return;

    setGenerating(true);
    setError("");

    const { data, error: err } = await apiFetch<InviteResponse>(
      `/api/patients/${selectedPatientId}/invite`,
      {
        method: "POST",
        body: JSON.stringify({ regenerate }),
      },
    );

    setGenerating(false);

    if (err) {
      setError(err);
      return;
    }

    setInviteCode(data?.inviteCode ?? null);
    showToast(regenerate ? "새 초대 코드가 생성되었습니다" : "초대 코드가 생성되었습니다");
  };

  const getShareMessage = () => {
    const patient = ownedPatients.find((p) => p.id === selectedPatientId);
    const name = patient?.name ?? "환자";
    return `간병잇다 초대 코드: ${inviteCode}\n${name} 환자 간병 기록에 참여해 주세요.`;
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("코드가 복사되었습니다");
    } catch {
      setError("클립보드 복사에 실패했습니다.");
    }
  };

  const handleCopyMessage = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(getShareMessage());
      showToast("공유 메시지가 복사되었습니다");
    } catch {
      setError("클립보드 복사에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (!inviteCode || !navigator.share) {
      await handleCopyMessage();
      return;
    }

    try {
      await navigator.share({
        title: "간병잇다 초대",
        text: getShareMessage(),
      });
    } catch {
      /* 사용자가 공유 취소 */
    }
  };

  const handleJoinSuccess = (patient: PatientInfo, alreadyJoined?: boolean) => {
    showToast(
      alreadyJoined ? "이미 참여 중인 환자입니다" : "환자 간병에 참여했습니다",
    );
    router.push(`/care/${patient.id}`);
    router.refresh();
  };

  if (loading) return <LoadingScreen />;

  const selectedPatient = ownedPatients.find((p) => p.id === selectedPatientId);

  return (
    <AppPage>
      <AppPageHeader>
        <div className="flex items-center gap-3">
          <Link
            href={preselectedId ? `/care/${preselectedId}` : "/"}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-black md:text-lg">교대자 초대</h1>
        </div>
      </AppPageHeader>

      <AppPageMain className="space-y-4 md:space-y-6">
        {error && <ErrorAlert message={error} />}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-black text-gray-900 md:text-base">
            <UserPlus className="h-4 w-4 text-blue-600" />
            초대 코드로 참여
          </h2>
          <p className="mb-4 text-xs font-bold text-gray-500 md:text-sm">
            다른 간병인에게 받은 코드를 입력하면 해당 환자 기록에 참여할 수 있습니다.
          </p>
          <InviteJoinForm
            compact
            onSuccess={handleJoinSuccess}
            onError={setError}
          />
        </div>

        {ownedPatients.length > 0 ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 md:p-5">
            <h2 className="mb-1 text-sm font-black text-gray-900 md:text-base">
              초대 코드 생성 및 공유
            </h2>
            <p className="mb-4 text-xs font-bold text-gray-600 md:text-sm">
              코드를 공유하면 다른 간병인이 같은 환자의 인수인계 기록을 함께 볼 수 있습니다.
            </p>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                환자 선택
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-500"
              >
                {ownedPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatRoomLabel(p.room)} {formatBedLabel(p.bed)}
                  </option>
                ))}
              </select>
            </div>

            {inviteCode ? (
              <div className="rounded-xl border-2 border-blue-200 bg-white p-4 text-center">
                <p className="text-xs font-bold text-gray-500">초대 코드</p>
                <p className="my-2 text-3xl font-black tracking-[0.3em] text-blue-700 md:text-4xl">
                  {inviteCode}
                </p>
                {selectedPatient && (
                  <p className="text-xs font-bold text-gray-500">
                    {selectedPatient.name} 환자 · {formatRoomLabel(selectedPatient.room)}{" "}
                    {formatBedLabel(selectedPatient.bed)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-100 md:text-sm"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    코드 복사
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-100 md:text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    메시지 복사
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700 md:text-sm"
                  >
                    <Share2 className="h-4 w-4" />
                    공유하기
                  </button>
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => handleGenerate(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 hover:bg-orange-100 disabled:opacity-60 md:text-sm"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    재생성
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={generating || !selectedPatientId}
                onClick={() => handleGenerate(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <UserPlus className="h-5 w-5" />
                {generating ? "생성 중…" : "초대 코드 생성"}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="text-sm font-black text-gray-700">내가 등록한 환자가 없습니다</p>
            <p className="mt-1 text-xs font-bold text-gray-500">
              환자를 등록한 후 초대 코드를 생성할 수 있습니다.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block rounded-xl bg-teal-600 px-6 py-3 text-sm font-black text-white hover:bg-teal-700"
            >
              환자 등록하기
            </Link>
          </div>
        )}
      </AppPageMain>

      {toast && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-xs font-bold text-white shadow-lg md:text-sm">
          {toast}
        </div>
      )}
    </AppPage>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <InvitePageContent />
    </Suspense>
  );
}
