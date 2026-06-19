"use client";

import { useRouter } from "next/navigation";
import PatientForm from "@/components/PatientForm";
import type { PatientInfo } from "@/types";

export default function PatientRegistration() {
  const router = useRouter();

  const handleSuccess = (patient: PatientInfo) => {
    router.push(`/care/${patient.id}`);
    router.refresh();
  };

  return (
    <PatientForm
      mode="create"
      title="간병 시작하기"
      subtitle="환자 정보 등록"
      submitLabel="등록 완료 및 간병 시작"
      onSuccess={handleSuccess}
    />
  );
}
