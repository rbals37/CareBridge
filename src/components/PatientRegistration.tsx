"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import ErrorAlert from "@/components/ui/ErrorAlert";
import AppPage, { AppPageHeader, AppPageMain } from "@/components/layout/AppPage";
import type { PatientInfo } from "@/types";

export default function PatientRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "" as "" | "male" | "female",
    ward: "",
    room: "",
    bed: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: err } = await apiFetch<{ patient: PatientInfo }>("/api/patients", {
      method: "POST",
      body: JSON.stringify({
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        ward: formData.ward || undefined,
        room: formData.room,
        bed: formData.bed,
      }),
    });

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (data?.patient) {
      router.push(`/care/${data.patient.id}`);
    } else {
      router.push("/");
    }
    router.refresh();
  };

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
            <p className="text-xs font-bold text-gray-500 md:text-sm">환자 정보 등록</p>
          </div>
        </div>
      </AppPageHeader>

      <AppPageMain className="pb-28 md:pb-8">
        <div className="mb-4 flex items-start gap-3 rounded-r-xl border-l-4 border-teal-500 bg-teal-50 p-4 md:mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-teal-900 md:text-base">환자 정보를 등록해주세요</p>
            <p className="mt-1 text-xs font-bold leading-relaxed text-teal-800 md:text-sm">
              MongoDB에 저장되며 다른 간병인과 공유할 수 있습니다.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black md:text-base">
              <span className="h-4 w-1 rounded-full bg-teal-500" />
              환자 기본 정보
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                  환자 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="홍길동"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                    나이 *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="80"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                    성별 *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                    required
                  >
                    <option value="">선택</option>
                    <option value="male">남</option>
                    <option value="female">여</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black md:text-base">
              <span className="h-4 w-1 rounded-full bg-teal-500" />
              병동 및 병실
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                  병동 (선택)
                </label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => handleChange("ward", e.target.value)}
                  placeholder="3동"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                    병실 *
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => handleChange("room", e.target.value)}
                    placeholder="302"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                    베드 *
                  </label>
                  <input
                    type="text"
                    value={formData.bed}
                    onChange={(e) => handleChange("bed", e.target.value)}
                    placeholder="1"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-md hover:bg-teal-700 disabled:opacity-60 md:py-4 md:text-base"
            >
              <CheckCircle2 className="h-5 w-5" />
              {loading ? "등록 중…" : "등록 완료 및 간병 시작"}
            </button>
          </div>
        </form>
      </AppPageMain>
    </AppPage>
  );
}
