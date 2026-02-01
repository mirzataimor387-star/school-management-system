import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Student from "@/models/Student";
import { getAuthUser } from "@/utils/getAuthUser";

/*
====================================
GET → Principal class-wise students
(section ignored — fee class based)
====================================
*/

export async function GET(req) {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    // 🔐 principal only
    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { success: false, students: [], message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ classId from query
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        {
          success: false,
          students: [],
          message: "classId is required",
        },
        { status: 400 }
      );
    }

    // ✅ CLASS BASED (NO SECTION)
    const students = await Student.find({
      campusId: authUser.campusId,
      classId,              // ← only class
      status: "active",
    })
      .sort({ rollNumber: 1 })
      .select(
        "name fatherName rollNumber classId session status"
      )
      .populate("classId", "className"); // ❌ no section

    return NextResponse.json({
      success: true,
      students,
    });

  } catch (err) {
    console.error("PRINCIPAL STUDENTS ERROR:", err.message);

    return NextResponse.json(
      {
        success: false,
        students: [],
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
