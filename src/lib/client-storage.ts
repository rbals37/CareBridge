import type { PatientInfo } from "@/components/MainDashboard";

const AUTH_KEY = "carebridge_auth";
const PATIENT_KEY = "carebridge_patient";
const HANDOFF_PREFIX = "carebridge_handoff_";

export interface StoredHandoff {
  mealAmount?: string | null;
  excretionSleep?: { urine: boolean; feces: boolean; sleep: boolean };
  mobility?: string | null;
  emotion?: string | null;
  medications?: Record<string, boolean>;
  memo?: string;
  voiceMemoUrl?: string;
  customFields?: { label: string; value: string | number | boolean; type?: string }[];
  status?: string;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function setLoggedIn(value: boolean) {
  sessionStorage.setItem(AUTH_KEY, value ? "true" : "false");
}

export function getPatient(): PatientInfo | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PATIENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PatientInfo;
  } catch {
    return null;
  }
}

export function savePatient(patient: PatientInfo) {
  sessionStorage.setItem(PATIENT_KEY, JSON.stringify(patient));
}

function handoffKey(room: string, bed: string, date: string) {
  return `${HANDOFF_PREFIX}${room}_${bed}_${date}`;
}

export function getLocalHandoff(
  room: string,
  bed: string,
  dateIso: string,
): StoredHandoff | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(handoffKey(room, bed, dateIso));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredHandoff;
  } catch {
    return null;
  }
}

export function saveLocalHandoff(
  room: string,
  bed: string,
  dateIso: string,
  data: StoredHandoff,
) {
  localStorage.setItem(handoffKey(room, bed, dateIso), JSON.stringify(data));
}
