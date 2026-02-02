import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Student from "@/models/Student";
import FeeStructure from "@/models/FeeStructure";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";

export async function POST(request) {
  try {
    // ===============================
    // DB CONNECT
    // ===============================
    await dbConnect();

    // ===============================
    // AUTH  ✅ FIXED
    // ===============================
    const authUser = await getAuthUser(request);

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        {
          success: false,
          preview: [],
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // ===============================
    // BODY
    // ===============================
    const { classId, month, year } = await request.json();

    // ===============================
    // VALIDATION
    // ===============================
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        {
          success: false,
          preview: [],
          message: "Invalid or missing classId",
        },
        { status: 400 }
      );
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (
      !monthNum ||
      monthNum < 1 ||
      monthNum > 12 ||
      !yearNum ||
      yearNum < 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          preview: [],
          message: "Invalid month or year",
        },
        { status: 400 }
      );
    }

    // ===============================
    // STUDENTS
    // ===============================
    const students = await Student.find({
      campusId: authUser.campusId,
      classId: new mongoose.Types.ObjectId(classId),
      status: "active",
    })
      .sort({ rollNumber: 1 })
      .select("_id name rollNumber");

    if (!students.length) {
      return NextResponse.json(
        {
          success: true,
          preview: [],
          message: "No active students found in this class",
        },
        { status: 200 }
      );
    }

    // ===============================
    // STRUCTURE
    // ===============================
    const structure = await FeeStructure.findOne({
      campusId: authUser.campusId,
      classId,
    });

    if (!structure) {
      return NextResponse.json(
        {
          success: false,
          preview: [],
          message: "Fee structure not found for this class",
        },
        { status: 404 }
      );
    }

    // ===============================
    // ADJUSTMENTS
    // ===============================
    const adjustments = await StudentFeeAdjustment.find({
      campusId: authUser.campusId,
      classId,
      month: monthNum,
      year: yearNum,
    });

    const adjustmentMap = {};
    for (const adj of adjustments) {
      adjustmentMap[adj.studentId.toString()] = adj;
    }

    // ===============================
    // PREVIEW BUILD
    // ===============================
    const preview = students.map((student) => {
      const adj = adjustmentMap[student._id.toString()] || {};

      const baseFee = Number(structure.monthlyFee);
      const discount = Number(adj.discount || 0);
      const extraFee = Number(adj.extraFee || 0);

      return {
        studentId: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        baseFee,
        discount,
        extraFee,
        payable: baseFee + extraFee - discount,
      };
    });

    // ===============================
    // RESPONSE
    // ===============================
    return NextResponse.json(
      {
        success: true,
        preview,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("FEE PREVIEW API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        preview: [],
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
