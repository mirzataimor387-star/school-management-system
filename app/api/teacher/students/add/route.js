import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/connectdb";

import Student from "@/models/Student";
import Class from "@/models/Class";

export async function POST(req) {
  await dbConnect();

  try {
    // =====================
    // AUTH
    // =====================
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await req.json();

    // =====================
    // FIND TEACHER CLASS
    // =====================
    const assignedClass = await Class.findOne({
      classTeacher: decoded.id,
    });

    if (!assignedClass) {
      return NextResponse.json(
        { message: "No class assigned to teacher" },
        { status: 403 }
      );
    }

    // =====================
    // CREATE STUDENT
    // =====================
    const student = await Student.create({
      ...body,

      classId: assignedClass._id,
      campusId: assignedClass.campusId,
      session: assignedClass.session,
      createdBy: decoded.id,
    });

    return NextResponse.json({
      success: true,
      message: "Student added successfully",
      student,
    });

  } catch (err) {
    console.log("ADD STUDENT ERROR:", err.message);

    // =====================
    // DUPLICATE HANDLING
    // =====================
    if (err.code === 11000) {
      if (err.message.includes("rollNumber")) {
        return NextResponse.json(
          {
            message:
              "This roll number already exists in this class for this session",
          },
          { status: 400 }
        );
      }

      if (err.message.includes("admissionNumber")) {
        return NextResponse.json(
          {
            message:
              "Admission number already exists in school records",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
