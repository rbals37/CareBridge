"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginScreen from "@/components/LoginScreen";
import { getPatient, isLoggedIn } from "@/lib/client-storage";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn() && getPatient()) {
      router.replace("/");
    }
  }, [router]);

  if (typeof window !== "undefined" && isLoggedIn() && getPatient()) {
    return <LoadingScreen />;
  }

  return <LoginScreen />;
}
