import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Attendance from "@/models/Attendance";
import Class from "@/models/Class";

/* ===============================
   GET — check today's attendance
================================ */
export async function GET(request) {
  try {
    await dbConnect();

    const authUser = await getAuthUser(request);

    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");
    const session = searchParams.get("session");

    if (!classId || !date || !session) {
      return NextResponse.json(
        { message: "Missing parameters" },
        { status: 400 }
      );
    }

    const cls = await Class.findOne({
      _id: classId,
      classTeacher: authUser.id,
    });

    if (!cls) {
      return NextResponse.json(
        { message: "Not your class" },
        { status: 403 }
      );
    }

    const attendance = await Attendance.findOne({
      classId,
      session,
      date,
    }).populate("records.studentId", "name rollNumber");

    if (!attendance) {
      return NextResponse.json({ attendance: null });
    }

    return NextResponse.json({ attendance });

  } catch (err) {
    console.error("ATTENDANCE GET ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* ===============================
   POST — mark attendance
================================ */
export async function POST(request) {
  try {
    await dbConnect();

    const authUser = await getAuthUser(request);

    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId, session, date, records } = await request.json();

    if (!classId || !session || !date || !records?.length) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const cls = await Class.findOne({
      _id: classId,
      classTeacher: authUser.id,
    });

    if (!cls) {
      return NextResponse.json(
        { message: "You are not class teacher of this class" },
        { status: 403 }
      );
    }

    const alreadyMarked = await Attendance.findOne({
      classId,
      session,
      date,
    });

    if (alreadyMarked) {
      return NextResponse.json(
        { message: "Attendance already marked for today" },
        { status: 400 }
      );
    }

    const attendance = await Attendance.create({
      campusId: cls.campusId,
      classId,
      session,
      date,
      records,
      markedBy: authUser.id,
    });

    return NextResponse.json({
      message: "Attendance saved successfully",
      attendanceId: attendance._id,
    });

  } catch (err) {
    console.error("ATTENDANCE POST ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
