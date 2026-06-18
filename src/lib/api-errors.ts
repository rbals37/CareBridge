import { TOKEN_COOKIE, PATIENT_COOKIE } from "@/lib/jwt";
import { COOKIE_OPTIONS } from "@/lib/cookies";
import { NextResponse } from "next/server";
import { isDbConnectionError } from "@/lib/db";
import { AuthError, PatientError } from "@/lib/auth-errors";

export { AuthError, PatientError } from "@/lib/auth-errors";

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(TOKEN_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set(PATIENT_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export function clearTokenCookie(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export function setPatientCookie(response: NextResponse, patientId: string) {
  response.cookies.set(PATIENT_COOKIE, patientId, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof PatientError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (isDbConnectionError(error)) {
    console.error("[DB Error]", error);
    return NextResponse.json(
      {
        error:
          "데이터베이스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        code: "DB_CONNECTION_ERROR",
      },
      { status: 503 },
    );
  }
  console.error("[API Error]", error);
  return NextResponse.json(
    { error: "서버 오류가 발생했습니다." },
    { status: 500 },
  );
}
