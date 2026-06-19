export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  ward?: string;
  room: string;
  bed: string;
  isOwner?: boolean;
  inviteCode?: string;
}

export interface StoredHandoff {
  id?: string;
  saved?: boolean;
  mealAmount?: string | null;
  excretionSleep?: { urine: boolean; feces: boolean; sleep: boolean };
  mobility?: string | null;
  emotion?: string | null;
  medications?: Record<string, boolean>;
  memo?: string;
  voiceMemoUrl?: string;
  customFields?: {
    label: string;
    value: string | number | boolean;
    type?: string;
  }[];
  status?: string;
}
