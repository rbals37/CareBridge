import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import {
  requireAuth,
  setPatientCookie,
  toPatientInfo,
} from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";
import { normalizeBedInput, normalizeRoomInput } from "@/lib/patient-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectDB();

    const patients = await Patient.find({
      $or: [{ ownerId: user.id }, { caregiverIds: user.id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      patients: patients.map((p) => toPatientInfo(p, user.id)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { name, age, gender, ward, room, bed } = body;

    if (!name || !age || !gender || !room || !bed) {
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

    const existing = await Patient.findOne({
      ownerId: user.id,
      room: normalizedRoom,
      bed: normalizedBed,
    });

    if (existing) {
      return NextResponse.json(
        { error: "동일한 병실/베드의 환자가 이미 등록되어 있습니다." },
        { status: 409 },
      );
    }

    const patient = await Patient.create({
      ownerId: user.id,
      caregiverIds: [],
      name: name.trim(),
      age: Number(age),
      gender,
      ward: ward?.trim() || undefined,
      room: normalizedRoom,
      bed: normalizedBed,
    });

    const response = NextResponse.json(
      { patient: toPatientInfo(patient, user.id) },
      { status: 201 },
    );

    setPatientCookie(response, patient._id.toString());
    return response;
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
