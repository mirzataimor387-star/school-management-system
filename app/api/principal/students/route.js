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

    // ✅ AUTH (future-proof)
    const auth = await getAuthUser();

    if (!auth || !auth.isPrincipal || !auth.campus) {
      return NextResponse.json(
        {
          success: false,
          students: [],
          message: "Unauthorized",
        },
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

    // ✅ CLASS-BASED (NO SECTION)
    const students = await Student.find({
      campusId: auth.campus._id, // 🔒 principal campus
      classId,
      status: "active",
    })
      .sort({ rollNumber: 1 })
      .select("name fatherName rollNumber classId session status")
      .populate("classId", "className"); // ✅ no section

    return NextResponse.json({
      success: true,
      students,
    });

  } catch (error) {
    console.error("PRINCIPAL STUDENTS ERROR:", error);

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
