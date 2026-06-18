import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requirePatientAccess,
  toPatientInfo,
} from "@/lib/auth";
import { setPatientCookie, handleApiError } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(request);
    const patient = await requirePatientAccess(user.id, params.id);

    const response = NextResponse.json({ patient: toPatientInfo(patient) });
    setPatientCookie(response, params.id);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
