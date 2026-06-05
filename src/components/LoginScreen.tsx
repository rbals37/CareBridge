"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogIn, UserPlus, KeyRound } from "lucide-react";
import { setLoggedIn } from "@/lib/client-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
    router.push("/");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-br from-teal-50 via-white to-blue-50 px-5 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-sm flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
            <Heart className="h-9 w-9 fill-white text-white" />
          </div>
          <h1 className="text-3xl font-black text-teal-600">간병잇다</h1>
          <p className="mt-2 text-sm font-bold text-gray-600">
            스마트 간병 교대 및 인수인계
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-black text-gray-800">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-teal-500"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-md active:bg-teal-700"
            >
              <LogIn className="h-5 w-5" />
              로그인
            </button>
          </form>
        </div>

        <div className="mt-4 space-y-3">
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-white py-3.5 text-sm font-black text-teal-700 active:bg-teal-50"
          >
            <UserPlus className="h-5 w-5" />
            환자 등록 시작하기
          </Link>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white py-3.5 text-sm font-black text-gray-700"
          >
            <KeyRound className="h-5 w-5" />
            초대코드로 참여하기
          </button>
        </div>
      </div>
    </div>
  );
}
