import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import Handoff from "@/models/Handoff";
import {
  requireAuth,
  requirePatientAccess,
  requirePatientOwner,
  toPatientInfo,
  getActivePatientId,
} from "@/lib/auth";
import { handleApiError, clearPatientCookie } from "@/lib/api-errors";
import { normalizeBedInput, normalizeRoomInput } from "@/lib/patient-utils";
import {
  photoValidationMessage,
  validatePatientPhoto,
} from "@/lib/patient-photo";
import { PatientError } from "@/lib/auth-errors";

function resolvePhotoUrl(body: { photoUrl?: unknown }): string | null | undefined {
  try {
    return validatePatientPhoto(body.photoUrl);
  } catch (err) {
    const code = err instanceof Error ? err.message : "INVALID_PHOTO";
    throw new PatientError(photoValidationMessage(code), 400);
  }
}

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(request);
    const patient = await requirePatientAccess(user.id, params.id);
    return NextResponse.json({ patient: toPatientInfo(patient, user.id) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(request);
    await requirePatientOwner(user.id, params.id);

    const body = await request.json();
    const { name, age, gender, ward, room, bed } = body;
    const photoUrl = resolvePhotoUrl(body);

    if (!name?.trim() || !age || !gender || !room || !bed) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    const normalizedRoom = normalizeRoomInput(room);
    const normalizedBed = normalizeBedInput(bed);

    if (!normalizedRoom || !normalizedBed) {
      return NextResponse.json(
        { error: "병실과 베드 번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    await connectDB();

    const duplicate = await Patient.findOne({
      ownerId: user.id,
      room: normalizedRoom,
      bed: normalizedBed,
      _id: { $ne: params.id },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "동일한 병실/베드의 환자가 이미 등록되어 있습니다." },
        { status: 409 },
      );
    }

    const update: Record<string, unknown> = {
      name: name.trim(),
      age: Number(age),
      gender,
      ward: ward?.trim() || undefined,
      room: normalizedRoom,
      bed: normalizedBed,
    };

    if (photoUrl === null) {
      update.$unset = { photoUrl: 1 };
    } else if (photoUrl) {
      update.photoUrl = photoUrl;
    }

    const updated = await Patient.findByIdAndUpdate(
      params.id,
      update,
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "환자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ patient: toPatientInfo(updated, user.id) });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "동일한 병실/베드의 환자가 이미 등록되어 있습니다." },
        { status: 409 },
      );
    }
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

    const deleted = await Patient.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "환자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    await Handoff.deleteMany({ patientId: params.id });

    const response = NextResponse.json({ success: true });
    const activePatientId = await getActivePatientId(request);
    if (activePatientId === params.id) {
      clearPatientCookie(response);
    }

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
