// =======================================
// ✅ FORCE NODE RUNTIME (VERY IMPORTANT)
// =======================================
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

// =======================================
// 🔴 OLD IMPORT STYLE (commented for safety)
// import Class from "@/models/Class";
// import Student from "@/models/Student";
// import User from "@/models/User";
// import Campus from "@/models/Campus";
// =======================================

// =======================================
// ✅ VERIFIED MODEL IMPORTS
// (file names MUST exactly match)
// =======================================
import Class from "@/models/Class";
import Student from "@/models/Student";
import User from "@/models/User";
import Campus from "@/models/Campus";

// =======================================
// GET → Teacher My Classes
// =======================================
export async function GET(request) {
  try {
    // ===============================
    // DB CONNECT
    // ===============================
    await dbConnect();

    // ===============================
    // AUTH CHECK
    // ===============================
    const authUser = await getAuthUser(request);

    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ===============================
    // SAFETY: MODEL LOADED CHECK
    // ===============================
    if (!Class || !Student || !User) {
      throw new Error("One or more Mongoose models not loaded");
    }

    // ===============================
    // GET TEACHER
    // ===============================
    const teacher = await User.findById(authUser.id)
      .select("name avatar campusId");

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    // ===============================
    // GET CAMPUS (optional)
    // ===============================
    let campus = null;
    if (teacher.campusId) {
      campus = await Campus.findById(teacher.campusId)
        .select("code name");
    }

    // ===============================
    // GET ASSIGNED CLASSES
    // ===============================
    const classes = await Class.find({
      classTeacher: authUser.id,
    }).sort({ className: 1, section: 1 });

    // ===============================
    // NO CLASS ASSIGNED
    // ===============================
    if (!classes.length) {
      return NextResponse.json({
        assigned: false,
        teacherName: teacher.name,
        avatar: teacher.avatar,
        campusCode: campus?.code || null,
        classes: [],
      });
    }

    // ===============================
    // MAP CLASSES WITH STUDENT COUNT
    // ===============================
    const result = await Promise.all(
      classes.map(async (cls) => {
        const totalStudents = await Student.countDocuments({
          classId: cls._id,
        });

        return {
          classId: cls._id,
          className: cls.className,
          section: cls.section,
          session: cls.session,
          campusId: cls.campusId,
          totalStudents,
        };
      })
    );

    // ===============================
    // SUCCESS RESPONSE
    // ===============================
    return NextResponse.json({
      assigned: true,
      teacherName: teacher.name,
      avatar: teacher.avatar,
      campusCode: campus?.code || null,
      classes: result,
    });

  } catch (err) {
    console.error("TEACHER MY CLASS ERROR:", err);

    return NextResponse.json(
      {
        message: "Server error",
        error: err.message, // helpful during dev
      },
      { status: 500 }
    );
  }
}
