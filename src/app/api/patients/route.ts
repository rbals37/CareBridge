import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";

export async function GET() {
  try {
    await connectDB();
    const patients = await Patient.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ patients });
  } catch (error) {
    console.error("[GET /api/patients]", error);
    return NextResponse.json(
      { error: "환자 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, age, gender, ward, room, bed } = body;

    if (!name || !age || !gender || !room || !bed) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 },
      );
    }

    const patient = await Patient.create({
      name,
      age: Number(age),
      gender,
      ward,
      room,
      bed,
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/patients]", error);
    return NextResponse.json(
      { error: "DB 연결 실패", offline: true },
      { status: 503 },
    );
  }
}
