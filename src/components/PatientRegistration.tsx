"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

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

    const { error: err } = await apiFetch("/api/patients", {
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

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg active:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-base font-black text-gray-900">간병 시작하기</h1>
          <p className="text-xs font-bold text-gray-500">환자 정보 등록</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mb-4 flex items-start gap-3 rounded-r-xl border-l-4 border-teal-500 bg-teal-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-teal-900">환자 정보를 등록해주세요</p>
            <p className="mt-1 text-xs font-bold leading-relaxed text-teal-800">
              MongoDB에 저장되며 다른 간병인과 공유할 수 있습니다.
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black">
              <span className="h-4 w-1 rounded-full bg-teal-500" />
              환자 기본 정보
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black text-gray-700">
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
                  <label className="mb-1 block text-xs font-black text-gray-700">
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
                  <label className="mb-1 block text-xs font-black text-gray-700">
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

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black">
              <span className="h-4 w-1 rounded-full bg-teal-500" />
              병동 및 병실
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black text-gray-700">
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
                  <label className="mb-1 block text-xs font-black text-gray-700">
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
                  <label className="mb-1 block text-xs font-black text-gray-700">
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
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md safe-bottom">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-md active:bg-teal-700 disabled:opacity-60"
          >
            <CheckCircle2 className="h-5 w-5" />
            {loading ? "등록 중…" : "등록 완료 및 간병 시작"}
          </button>
        </div>
      </div>
    </div>
  );
}
