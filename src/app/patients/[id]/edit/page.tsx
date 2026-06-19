"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PatientForm, { patientToFormData } from "@/components/PatientForm";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { apiFetch } from "@/lib/api-client";
import type { PatientInfo } from "@/types";

interface PatientResponse {
  patient: PatientInfo;
}

export default function PatientEditPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await apiFetch<PatientResponse>(`/api/patients/${patientId}`);

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (res.status === 403 || res.status === 404 || !res.data?.patient) {
        router.replace("/settings");
        return;
      }

      if (!res.data.patient.isOwner) {
        setError("환자 정보를 수정할 권한이 없습니다.");
        return;
      }

      setPatient(res.data.patient);
    }

    if (patientId) load();
  }, [patientId, router]);

  const handleSuccess = (updated: PatientInfo) => {
    router.push(`/care/${updated.id}`);
    router.refresh();
  };

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!patient) return <LoadingScreen />;

  return (
    <PatientForm
      mode="edit"
      patientId={patientId}
      initialData={patientToFormData(patient)}
      initialPhotoUrl={patient.photoUrl}
      backHref="/settings"
      title="환자 정보 수정"
      subtitle={patient.name}
      submitLabel="수정 완료"
      onSuccess={handleSuccess}
    />
  );
}
