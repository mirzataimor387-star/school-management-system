import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import { Class } from "@/models/Class";
import User from "@/models/User";
import { getAuthUser } from "@/utils/getAuthUser";

/* =========================================
   GET → classes + assigned teacher
========================================= */
export async function GET() {
  await dbConnect();

  const auth = await getAuthUser();

  if (!auth || !auth.isPrincipal || !auth.campus) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", classes: [] },
      { status: 401 }
    );
  }

  const campusId = new mongoose.Types.ObjectId(auth.campus._id);

  const classes = await Class.find({ campusId })
    .populate({
      path: "classTeacher",
      model: User,
      select: "name email",
    })
    .sort({ className: 1, section: 1 })
    .lean();

  return NextResponse.json({
    success: true,
    classes,
  });
}

/* =========================================
   POST → assign / change class teacher
========================================= */
export async function POST(req) {
  await dbConnect();

  const auth = await getAuthUser();

  if (!auth || !auth.isPrincipal || !auth.campus) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { classId, teacherId } = await req.json();

  if (!classId || !teacherId) {
    return NextResponse.json(
      { success: false, message: "Missing data" },
      { status: 400 }
    );
  }

  const campusId = new mongoose.Types.ObjectId(auth.campus._id);

  const cls = await Class.findOne({ _id: classId, campusId });
  if (!cls) {
    return NextResponse.json(
      { success: false, message: "Class not found" },
      { status: 404 }
    );
  }

  const teacher = await User.findOne({
    _id: teacherId,
    role: "teacher",
    campusId,
  });

  if (!teacher) {
    return NextResponse.json(
      { success: false, message: "Invalid teacher" },
      { status: 400 }
    );
  }

  cls.classTeacher = teacher._id;
  await cls.save();

  return NextResponse.json({
    success: true,
    message: "Class teacher assigned successfully",
  });
}

/* =========================================
   DELETE → remove class teacher
========================================= */
export async function DELETE(req) {
  await dbConnect();

  const auth = await getAuthUser();

  if (!auth || !auth.isPrincipal || !auth.campus) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { classId } = await req.json();

  const campusId = new mongoose.Types.ObjectId(auth.campus._id);

  const cls = await Class.findOne({ _id: classId, campusId });
  if (!cls) {
    return NextResponse.json(
      { success: false, message: "Class not found" },
      { status: 404 }
    );
  }

  cls.classTeacher = null;
  await cls.save();

  return NextResponse.json({
    success: true,
    message: "Class teacher removed",
  });
}
