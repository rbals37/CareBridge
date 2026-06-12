import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import {
  requireAuth,
  setPatientCookie,
  toPatientInfo,
  handleApiError,
} from "@/lib/auth";

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
      patients: patients.map(toPatientInfo),
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

    const existing = await Patient.findOne({
      ownerId: user.id,
      room,
      bed,
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
      room: room.trim(),
      bed: bed.trim(),
    });

    const response = NextResponse.json(
      { patient: toPatientInfo(patient) },
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
