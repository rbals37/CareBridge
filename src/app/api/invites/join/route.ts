import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import { requireAuth, setPatientCookie, toPatientInfo } from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";
import { PatientError } from "@/lib/auth-errors";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const code = body.code?.trim()?.toUpperCase();

    if (!code) {
      return NextResponse.json(
        { error: "초대 코드를 입력해 주세요." },
        { status: 400 },
      );
    }

    await connectDB();

    const patient = await Patient.findOne({ inviteCode: code }).lean();
    if (!patient) {
      throw new PatientError("유효하지 않은 초대 코드입니다.", 404);
    }

    if (patient.ownerId.toString() === user.id) {
      throw new PatientError("본인이 등록한 환자입니다.", 400);
    }

    const alreadyJoined = patient.caregiverIds.some(
      (id) => id.toString() === user.id,
    );

    if (!alreadyJoined) {
      await Patient.findByIdAndUpdate(patient._id, {
        $addToSet: { caregiverIds: user.id },
      });
    }

    const updated = await Patient.findById(patient._id).lean();
    if (!updated) {
      throw new PatientError("환자를 찾을 수 없습니다.", 404);
    }

    const response = NextResponse.json({
      patient: toPatientInfo(updated, user.id),
      alreadyJoined,
    });

    setPatientCookie(response, patient._id.toString());
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
