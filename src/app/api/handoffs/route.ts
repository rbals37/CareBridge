import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import connectDB from "@/lib/db";
import Handoff from "@/models/Handoff";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const dateStr = searchParams.get("date");
    const room = searchParams.get("room");
    const bed = searchParams.get("bed");

    if (!dateStr || !room) {
      return NextResponse.json(
        { error: "date와 room 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    const date = new Date(dateStr);
    const query: Record<string, unknown> = {
      room,
      date: { $gte: startOfDay(date), $lte: endOfDay(date) },
    };
    if (bed) query.bed = bed;

    const handoff = await Handoff.findOne(query).lean();
    return NextResponse.json({ handoff });
  } catch (error) {
    console.error("[GET /api/handoffs]", error);
    return NextResponse.json({ handoff: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { date, room, bed, status, ...rest } = body;

    if (!date || !room || !rest.patientName) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    const parsedDate = startOfDay(new Date(date));

    const handoff = await Handoff.findOneAndUpdate(
      { room, bed: bed ?? "", date: parsedDate },
      {
        ...rest,
        room,
        bed,
        date: parsedDate,
        status: status ?? "handed_off",
      },
      { upsert: true, new: true, runValidators: true },
    );

    return NextResponse.json({ handoff }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/handoffs]", error);
    return NextResponse.json(
      { error: "DB 연결 실패", offline: true },
      { status: 503 },
    );
  }
}
