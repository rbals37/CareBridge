import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import { requireAuth, requirePatientOwner, toPatientInfo } from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";
import { generateInviteCode } from "@/lib/patient-utils";

export const dynamic = "force-dynamic";

async function createUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateInviteCode();
    const exists = await Patient.findOne({ inviteCode: code }).lean();
    if (!exists) return code;
  }
  throw new Error("초대 코드 생성에 실패했습니다.");
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(request);
    const patient = await requirePatientOwner(user.id, params.id);

    return NextResponse.json({
      inviteCode: patient.inviteCode ?? null,
      patient: toPatientInfo(patient, user.id),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(request);
    await requirePatientOwner(user.id, params.id);

    const body = await request.json().catch(() => ({}));
    const regenerate = body.regenerate === true;

    await connectDB();

    const existing = await Patient.findById(params.id).lean();
    if (!existing) {
      return NextResponse.json(
        { error: "환자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const inviteCode =
      regenerate || !existing.inviteCode
        ? await createUniqueInviteCode()
        : existing.inviteCode;

    const updated = await Patient.findByIdAndUpdate(
      params.id,
      { inviteCode },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "환자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      inviteCode: updated.inviteCode,
      patient: toPatientInfo(updated, user.id),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(request);
    await requirePatientOwner(user.id, params.id);

    await connectDB();

    const updated = await Patient.findByIdAndUpdate(
      params.id,
      { $unset: { inviteCode: 1 } },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "환자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
