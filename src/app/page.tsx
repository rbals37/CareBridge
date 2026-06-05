"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainDashboard, { type PatientInfo } from "@/components/MainDashboard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { getPatient, isLoggedIn } from "@/lib/client-storage";

export default function HomePage() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    const stored = getPatient();
    if (!stored) {
      router.replace("/register");
      return;
    }

    setPatient(stored);
    setReady(true);
  }, [router]);

  if (!ready || !patient) return <LoadingScreen />;

  return <MainDashboard patient={patient} />;
}
