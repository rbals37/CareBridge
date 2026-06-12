import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import connectDB from "@/lib/db";
import Handoff from "@/models/Handoff";
import {
  requireAuth,
  requirePatientAccess,
  handleApiError,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectDB();

    const { searchParams } = request.nextUrl;
    const dateStr = searchParams.get("date");
    const patientId = searchParams.get("patientId");

    if (!dateStr || !patientId) {
      return NextResponse.json(
        { error: "date와 patientId 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    await requirePatientAccess(user.id, patientId);

    const date = new Date(dateStr);
    const handoff = await Handoff.findOne({
      patientId,
      date: { $gte: startOfDay(date), $lte: endOfDay(date) },
    }).lean();

    return NextResponse.json({ handoff });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectDB();

    const body = await request.json();
    const {
      patientId,
      date,
      status,
      mealAmount,
      excretionSleep,
      mobility,
      emotion,
      medications,
      memo,
      voiceMemoUrl,
      customFields,
    } = body;

    if (!date || !patientId) {
      return NextResponse.json(
        { error: "patientId와 date가 필요합니다." },
        { status: 400 },
      );
    }

    await requirePatientAccess(user.id, patientId);

    const parsedDate = startOfDay(new Date(date));
    const updateData: Record<string, unknown> = {
      patientId,
      recordedBy: user.id,
      date: parsedDate,
      status: status ?? "handed_off",
      mealAmount,
      excretionSleep,
      mobility,
      emotion,
      medications,
      memo,
      voiceMemoUrl,
      customFields: customFields ?? [],
    };

    if (status === "accepted") {
      updateData.acceptedBy = user.id;
    }

    const handoff = await Handoff.findOneAndUpdate(
      { patientId, date: parsedDate },
      updateData,
      { upsert: true, new: true, runValidators: true },
    );

    return NextResponse.json({ handoff }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
