"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, UserPlus, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const { error: err } = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    router.push("/register");
    router.refresh();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-br from-teal-50 via-white to-blue-50 px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-sm">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          로그인으로
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
            <Heart className="h-8 w-8 fill-white text-white" />
          </div>
          <h1 className="text-2xl font-black text-teal-600">회원가입</h1>
          <p className="mt-1 text-xs font-bold text-gray-600">
            간병잇다 계정을 만들어 주세요
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {error}
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-black text-gray-800">
                이름
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="홍길동"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-black text-gray-800">
                이메일
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-black text-gray-800">
                비밀번호
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="6자 이상"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-black text-gray-800">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-md active:bg-teal-700 disabled:opacity-60"
            >
              <UserPlus className="h-5 w-5" />
              {loading ? "가입 중…" : "가입 완료"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
