"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainDashboard from "@/components/MainDashboard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { apiFetch } from "@/lib/api-client";
import type { PatientInfo, UserInfo } from "@/types";

interface MeResponse {
  user: UserInfo;
  patient: PatientInfo | null;
}

export default function HomePage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error, status } = await apiFetch<MeResponse>("/api/auth/me");

      if (status === 401 || error) {
        router.replace("/login");
        return;
      }

      if (!data?.patient) {
        router.replace("/register");
        return;
      }

      setUser(data.user);
      setPatient(data.patient);
      setReady(true);
    }

    load();
  }, [router]);

  if (!ready || !patient || !user) return <LoadingScreen />;

  return <MainDashboard patient={patient} user={user} />;
}
