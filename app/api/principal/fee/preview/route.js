import mongoose from "mongoose";
import { NextResponse } from "next/server";

import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import FeeStructure from "@/models/FeeStructure";
import Student from "@/models/Student";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";
import { getAuthUser } from "@/utils/getAuthUser";

/*
=====================================================
FINAL PREVIEW API (PRODUCTION SAFE)

✔ Discount populated
✔ Extra fee populated
✔ Correct arrears
✔ No scope / hoisting bug
✔ Preview === Generate === PDF
=====================================================
*/

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

    /* ===============================
       ALREADY GENERATED CHECK
       =============================== */
    const already = await FeeVoucher.findOne({
      campusId: user.campusId,
      classId,
      month: monthNum,
      year: yearNum,
    }).lean();

    if (already) {
      return NextResponse.json({
        success: true,
        alreadyGenerated: true,
      });
    }

    /* ===============================
       FEE STRUCTURE
       =============================== */
    const structure = await FeeStructure.findOne({
      campusId: user.campusId,
      classId,
    }).lean();

    if (!structure) {
      return NextResponse.json(
        { success: false, message: "Fee structure not found" },
        { status: 404 }
      );
    }

    /* ===============================
       STUDENTS
       =============================== */
    const students = await Student.find({
      campusId: user.campusId,
      classId,
      status: "active",
    }).lean();

    const preview = [];

    for (const student of students) {
      /* ---------- LAST UNPAID / PARTIAL ---------- */
      const lastVoucher = await FeeVoucher.findOne({
        campusId: user.campusId,
        studentId: student._id,
        status: { $in: ["unpaid", "partial"] },
        $or: [
          { year: { $lt: yearNum } },
          { year: yearNum, month: { $lt: monthNum } },
        ],
      })
        .sort({ year: -1, month: -1 })
        .select("totals received")
        .lean();

      const lastPayable = lastVoucher
        ? (lastVoucher.totals?.baseAmount || 0) +
          (lastVoucher.totals?.lateAmount || 0)
        : 0;

      const arrears = lastVoucher
        ? Math.max(0, lastPayable - (lastVoucher.received || 0))
        : 0;

      /* ---------- DISCOUNT / EXTRA ---------- */
      const adjustment = await StudentFeeAdjustment.findOne({
        campusId: user.campusId,
        studentId: student._id,
        classId,
        month: monthNum,
        year: yearNum,
      }).lean();

      const discount = adjustment?.discount || 0;
      const extraFee = adjustment?.extraFee || 0;

      const baseFee = structure.monthlyFee;

      preview.push({
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,

        baseFee,
        arrears,
        discount,
        extraFee,

        payable: Math.max(
          0,
          baseFee + arrears + extraFee - discount
        ),
      });
    }

    return NextResponse.json({ success: true, preview });

  } catch (err) {
    console.error("PREVIEW ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
