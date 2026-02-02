import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET() {
  try {
    await dbConnect();

    export async function GET(req) {
  const authUser = await getAuthUser(req);
}

    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ teacher ki classes
    const classes = await Class.find({
      classTeacher: authUser.id,
    });

    const classIds = classes.map(c => c._id);

    // ✅ all students of teacher
    const students = await Student.find({
      classId: { $in: classIds },
      status: "active",
    })
      .sort({ rollNumber: 1 })
      .select("rollNumber name fatherName status");

    return NextResponse.json({ students });

  } catch (err) {
    console.log("TEACHER STUDENTS ERROR:", err);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
