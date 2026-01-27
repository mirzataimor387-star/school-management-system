import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Class from "@/models/Class";
import ClassTeacher from "@/models/ClassTeacher";
import User from "@/models/User";

/* ===============================
   GET → classes + assigned teacher
================================ */
export async function GET() {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const classes = await Class.find({
      campusId: authUser.campusId,
    }).select("name section");

    const result = await Promise.all(
      classes.map(async (cls) => {
        const assignment = await ClassTeacher.findOne({
          classId: cls._id,
          campusId: authUser.campusId,
        }).populate("teacherId", "name");

        return {
          _id: cls._id,
          name: cls.name,
          section: cls.section,
          teacher: assignment?.teacherId || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      classes: result,
    });

  } catch (err) {
    console.log("CLASS BY CLASS ERROR:", err.message);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* ===============================
   POST → assign / change teacher
================================ */
export async function POST(req) {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId, teacherId } = await req.json();

    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
      campusId: authUser.campusId,
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Invalid teacher" },
        { status: 400 }
      );
    }

    await ClassTeacher.findOneAndUpdate(
      {
        classId,
        campusId: authUser.campusId,
      },
      {
        teacherId,
        campusId: authUser.campusId,
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Teacher assigned successfully",
    });

  } catch (err) {
    console.log("ASSIGN TEACHER ERROR:", err.message);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   REMOVE CLASS TEACHER
========================= */
export async function DELETE(req) {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId } = await req.json();

    await Class.findOneAndUpdate(
      {
        _id: classId,
        campusId: authUser.campusId,
      },
      {
        classTeacher: null,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Class teacher removed",
    });

  } catch (err) {
    console.log("REMOVE CLASS TEACHER ERROR:", err.message);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

