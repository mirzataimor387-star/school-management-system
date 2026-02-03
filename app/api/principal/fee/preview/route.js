import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Student from "@/models/Student";
import FeeStructure from "@/models/FeeStructure";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";
import FeeVoucher from "@/models/FeeVoucher";

export async function POST(req) {
  try {
    await dbConnect();

    const user = await getAuthUser(req);
    if (!user || user.role !== "principal") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId, month, year } = await req.json();
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (
      !classId ||
      !mongoose.Types.ObjectId.isValid(classId) ||
      !monthNum ||
      !yearNum
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    /* ============================================
       🔥 CHECK: ALREADY GENERATED?
       ============================================ */
    const already = await FeeVoucher.exists({
      campusId: user.campusId,
      classId,
      month: monthNum,
      year: yearNum,
    });

    if (already) {
      return NextResponse.json({
        success: true,
        alreadyGenerated: true,
      });
    }

    /* ============================================
       NORMAL PREVIEW FLOW
       ============================================ */
    const students = await Student.find({
      campusId: user.campusId,
      classId,
      status: "active",
    })
      .sort({ rollNumber: 1 })
      .select("_id name rollNumber");

    if (!students.length) {
      return NextResponse.json({
        success: true,
        preview: [],
      });
    }

    const structure = await FeeStructure.findOne({
      campusId: user.campusId,
      classId,
    });

    if (!structure) {
      return NextResponse.json(
        { success: false, message: "Fee structure not found" },
        { status: 404 }
      );
    }

    const adjustments = await StudentFeeAdjustment.find({
      campusId: user.campusId,
      classId,
      month: monthNum,
      year: yearNum,
    });

    const adjMap = {};
    adjustments.forEach(a => {
      adjMap[a.studentId.toString()] = a;
    });

    const preview = students.map(s => {
      const adj = adjMap[s._id.toString()] || {};
      const baseFee = Number(structure.monthlyFee);

      const discount = Number(adj.discount || 0);
      const extraFee = Number(adj.extraFee || 0);

      return {
        studentId: s._id,
        rollNumber: s.rollNumber,
        name: s.name,
        baseFee,
        discount,
        extraFee,
        payable: baseFee + extraFee - discount,
      };
    });

    return NextResponse.json({
      success: true,
      alreadyGenerated: false,
      preview,
    });

  } catch (err) {
    console.error("PREVIEW ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
