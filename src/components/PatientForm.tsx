"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import ErrorAlert from "@/components/ui/ErrorAlert";
import AppPage, { AppPageHeader, AppPageMain } from "@/components/layout/AppPage";
import {
  normalizeBedInput,
  normalizeRoomInput,
} from "@/lib/patient-utils";
import type { PatientInfo } from "@/types";
import PatientPhotoPicker from "@/components/PatientPhotoPicker";

export interface PatientFormData {
  name: string;
  age: string;
  gender: "" | "male" | "female";
  ward: string;
  room: string;
  bed: string;
}

interface PatientFormProps {
  mode: "create" | "edit";
  initialData?: PatientFormData;
  patientId?: string;
  backHref?: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  onSuccess: (patient: PatientInfo) => void;
  headerExtra?: React.ReactNode;
  initialPhotoUrl?: string;
}

const EMPTY_FORM: PatientFormData = {
  name: "",
  age: "",
  gender: "",
  ward: "",
  room: "",
  bed: "",
};

export function patientToFormData(patient: PatientInfo): PatientFormData {
  return {
    name: patient.name,
    age: String(patient.age),
    gender: patient.gender,
    ward: patient.ward ?? "",
    room: patient.room,
    bed: patient.bed,
  };
}

export default function PatientForm({
  mode,
  initialData = EMPTY_FORM,
  patientId,
  backHref = "/",
  title,
  subtitle,
  submitLabel,
  onSuccess,
  headerExtra,
  initialPhotoUrl,
}: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<PatientFormData>(initialData);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialPhotoUrl);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoomChange = (value: string) => {
    handleChange("room", normalizeRoomInput(value));
  };

  const handleBedChange = (value: string) => {
    handleChange("bed", normalizeBedInput(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: Record<string, unknown> = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      ward: formData.ward || undefined,
      room: normalizeRoomInput(formData.room),
      bed: normalizeBedInput(formData.bed),
    };

    if (photoRemoved) {
      payload.photoUrl = null;
    } else if (photoUrl) {
      payload.photoUrl = photoUrl;
    }

    const url = mode === "create" ? "/api/patients" : `/api/patients/${patientId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const { data, error: err } = await apiFetch<{ patient: PatientInfo }>(url, {
      method,
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (data?.patient) {
      onSuccess(data.patient);
    }
  };

  return (
    <AppPage variant="form">
      <AppPageHeader>
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-base font-black text-gray-900 md:text-lg">{title}</h1>
            <p className="text-xs font-bold text-gray-500 md:text-sm">{subtitle}</p>
          </div>
        </div>
        {headerExtra}
      </AppPageHeader>

      <AppPageMain className="pb-28 md:pb-8">
        <div className="mb-4 flex items-start gap-3 rounded-r-xl border-l-4 border-teal-500 bg-teal-50 p-4 md:mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-teal-900 md:text-base">
              {mode === "create" ? "환자 정보를 등록해주세요" : "환자 정보를 수정해주세요"}
            </p>
            <p className="mt-1 text-xs font-bold leading-relaxed text-teal-800 md:text-sm">
              병실 번호는 숫자만 입력해도 됩니다. &apos;호&apos;는 자동으로 붙습니다.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:col-span-2 md:p-5">
            <PatientPhotoPicker
              name={formData.name}
              value={photoUrl}
              onChange={(next) => {
                if (next === undefined) {
                  setPhotoUrl(undefined);
                  setPhotoRemoved(mode === "edit" && !!initialPhotoUrl);
                } else {
                  setPhotoUrl(next);
                  setPhotoRemoved(false);
                }
              }}
            />
          </div>

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
                    onChange={(e) =>
                      handleChange("gender", e.target.value as PatientFormData["gender"])
                    }
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
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      placeholder="302"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-10 font-bold outline-none focus:border-teal-500"
                      required
                    />
                    {formData.room && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                        호
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black text-gray-700 md:text-sm">
                    베드 *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.bed}
                      onChange={(e) => handleBedChange(e.target.value)}
                      placeholder="1"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-10 font-bold outline-none focus:border-teal-500"
                      required
                    />
                    {formData.bed && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                        번
                      </span>
                    )}
                  </div>
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
              {loading ? "저장 중…" : submitLabel}
            </button>
          </div>
        </form>
      </AppPageMain>
    </AppPage>
  );
}
