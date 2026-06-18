import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import {
  getAuthUser,
  getActivePatientId,
  toPatientInfo,
} from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await connectDB();

    let patient = null;
    const activePatientId = await getActivePatientId(request);

    if (activePatientId) {
      const doc = await Patient.findById(activePatientId).lean();
      if (doc) {
        const hasAccess =
          doc.ownerId.toString() === user.id ||
          doc.caregiverIds.some((id) => id.toString() === user.id);
        if (hasAccess) patient = toPatientInfo(doc);
      }
    }

    return NextResponse.json({ user, patient });
  } catch (error) {
    return handleApiError(error);
  }
}
