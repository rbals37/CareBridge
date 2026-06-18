import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import {
  requireAuth,
  requirePatientAccess,
  toPatientInfo,
} from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(request);
    const patient = await requirePatientAccess(user.id, params.id);
    return NextResponse.json({ patient: toPatientInfo(patient) });
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
    await requirePatientAccess(user.id, params.id);

    const body = await request.json();
    const { name, age, gender, ward, room, bed } = body;

    await connectDB();

    const updated = await Patient.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name: name.trim() }),
        ...(age && { age: Number(age) }),
        ...(gender && { gender }),
        ...(ward !== undefined && { ward: ward?.trim() || undefined }),
        ...(room && { room: room.trim() }),
        ...(bed && { bed: bed.trim() }),
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "환자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ patient: toPatientInfo(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
