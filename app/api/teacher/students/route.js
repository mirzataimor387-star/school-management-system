import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET() {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ get ALL classes of teacher
    const classes = await Class.find({
      classTeacher: authUser.id,
    });

    if (!classes.length) {
      return NextResponse.json({ students: [] });
    }

    const classIds = classes.map((c) => c._id);

    // ✅ get students of ALL teacher classes
    const students = await Student.find({
      classId: { $in: classIds },
      status: "active",
    })
      .sort({ rollNumber: 1 })
      .select("rollNumber name fatherName status");

    return NextResponse.json({ students });

  } catch (err) {
    console.log("TEACHER STUDENTS ERROR:", err.message);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
