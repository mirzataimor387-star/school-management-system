import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Attendance from "@/models/Attendance";

export async function POST(req) {
    await dbConnect();

    const { classId, date } = await req.json();

    const attendance = await Attendance.findOne({
        classId,
        date,
    });

    return NextResponse.json({
        marked: !!attendance,
    });
}
