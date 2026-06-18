"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MainDashboard from "@/components/MainDashboard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { apiFetch } from "@/lib/api-client";
import type { PatientInfo, UserInfo } from "@/types";

interface MeResponse {
  user: UserInfo;
}

interface PatientResponse {
  patient: PatientInfo;
}

export default function CarePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;
  const [user, setUser] = useState<UserInfo | null>(null);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const [me, res] = await Promise.all([
        apiFetch<MeResponse>("/api/auth/me"),
        apiFetch<PatientResponse>(`/api/patients/${patientId}`),
      ]);

      if (me.status === 401 || !me.data?.user) {
        router.replace("/login");
        return;
      }

      if (res.status === 404 || res.error || !res.data?.patient) {
        router.replace("/");
        return;
      }

      apiFetch(`/api/patients/${patientId}/select`, { method: "POST" });

      setUser(me.data.user);
      setPatient(res.data.patient);
      setReady(true);
    }

    if (patientId) load();
  }, [patientId, router]);

  if (!ready || !patient || !user) return <LoadingScreen />;

  return <MainDashboard patient={patient} user={user} />;
}
