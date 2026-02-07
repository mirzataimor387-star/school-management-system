import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Class from "@/models/Class";
import Student from "@/models/Student";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const user = await getAuthUser(request);

    // 🔐 only superadmin
    if (!user || user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { classId } = params;

    if (!classId) {
      return NextResponse.json(
        { success: false, message: "Class ID required" },
        { status: 400 }
      );
    }

    // ✅ Find class
    const cls = await Class.findById(classId);

    if (!cls) {
      return NextResponse.json(
        { success: false, message: "Class not found" },
        { status: 404 }
      );
    }

    // ✅ Students of this class
    const students = await Student.find(
      { classId: cls._id },
      { name: 1, rollNo: 1 }
    ).sort({ rollNo: 1 });

    return NextResponse.json({
      success: true,
      class: {
        _id: cls._id,
        className: cls.className,
        section: cls.section,
        session: cls.session,
        createdAt: cls.createdAt,
        studentsCount: students.length,
        students,
      },
    });

  } catch (err) {
    console.error("CLASS DETAIL ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
