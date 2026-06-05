"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-lg active:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-black">설정</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <Settings className="h-12 w-12 text-teal-600" />
        <p className="text-sm font-black text-gray-800">설정 화면 준비 중</p>
        <p className="text-xs font-bold text-gray-500">
          환자 정보 수정, 알림 설정 등이 추가될 예정입니다.
        </p>
        <Link href="/" className="mt-4 rounded-xl bg-teal-600 px-6 py-3 text-sm font-black text-white">
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
