import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Patient from "@/models/Patient";
import type { UserInfo, PatientInfo } from "@/types";
import {
  TOKEN_COOKIE,
  PATIENT_COOKIE,
  createToken,
  verifyToken,
  type TokenPayload,
} from "@/lib/jwt";
import { AuthError, PatientError } from "@/lib/auth-errors";
import {
  setAuthCookie,
  clearAuthCookie,
  setPatientCookie,
} from "@/lib/api-errors";

export { TOKEN_COOKIE, PATIENT_COOKIE, createToken, verifyToken };
export type { TokenPayload };
export { AuthError, PatientError };
export { setAuthCookie, clearAuthCookie, setPatientCookie };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getTokenFromRequest(
  request?: NextRequest,
): Promise<string | null> {
  if (request) {
    return request.cookies.get(TOKEN_COOKIE)?.value ?? null;
  }
  return cookies().get(TOKEN_COOKIE)?.value ?? null;
}

export async function getAuthPayload(
  request?: NextRequest,
): Promise<TokenPayload | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getAuthUser(request?: NextRequest) {
  const payload = await getAuthPayload(request);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId)
    .select("-passwordHash")
    .lean();

  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  } satisfies UserInfo;
}

export async function requireAuth(request?: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    throw new AuthError("로그인이 필요합니다.");
  }
  return user;
}

export function toPatientInfo(patient: {
  _id: { toString(): string };
  name: string;
  age: number;
  gender: "male" | "female";
  ward?: string;
  room: string;
  bed: string;
}): PatientInfo {
  return {
    id: patient._id.toString(),
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    ward: patient.ward,
    room: patient.room,
    bed: patient.bed,
  };
}

export async function getActivePatientId(
  request?: NextRequest,
): Promise<string | null> {
  if (request) {
    return request.cookies.get(PATIENT_COOKIE)?.value ?? null;
  }
  return cookies().get(PATIENT_COOKIE)?.value ?? null;
}

export async function getActivePatient(request?: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return null;

  const patientId = await getActivePatientId(request);
  if (!patientId) return null;

  await connectDB();
  const patient = await Patient.findById(patientId).lean();
  if (!patient) return null;

  const hasAccess =
    patient.ownerId.toString() === user.id ||
    patient.caregiverIds.some((id) => id.toString() === user.id);

  if (!hasAccess) return null;

  return toPatientInfo(patient);
}

export async function requirePatientAccess(userId: string, patientId: string) {
  await connectDB();
  const patient = await Patient.findById(patientId).lean();
  if (!patient) {
    throw new PatientError("환자를 찾을 수 없습니다.", 404);
  }

  const hasAccess =
    patient.ownerId.toString() === userId ||
    patient.caregiverIds.some((id) => id.toString() === userId);

  if (!hasAccess) {
    throw new PatientError("이 환자에 대한 접근 권한이 없습니다.", 403);
  }

  return patient;
}
