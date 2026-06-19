"use client";

import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import AppPage, { AppPageHeader, AppPageMain } from "@/components/layout/AppPage";

export default function InvitePage() {
  return (
    <AppPage>
      <AppPageHeader>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-black md:text-lg">교대자 초대</h1>
        </div>
      </AppPageHeader>
      <AppPageMain>
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center md:py-20">
          <UserPlus className="h-12 w-12 text-blue-600 md:h-16 md:w-16" />
          <p className="text-sm font-black text-gray-800 md:text-base">초대 기능 준비 중</p>
          <p className="text-xs font-bold text-gray-500 md:text-sm">
            초대 코드 생성 및 공유 기능이 추가될 예정입니다.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-xl bg-teal-600 px-6 py-3 text-sm font-black text-white hover:bg-teal-700 md:px-8 md:py-3.5 md:text-base"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </AppPageMain>
    </AppPage>
  );
}
