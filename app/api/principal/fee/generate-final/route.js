import mongoose from "mongoose";
import { NextResponse } from "next/server";

import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import FeeStructure from "@/models/FeeStructure";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";
import FeeCycle from "@/models/FeeCycle";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(req) {
  let session;

  try {
    await dbConnect();

    const user = await getAuthUser(req);
    if (!user || user.role !== "principal") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId, students = [], month, year } = await req.json();

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
       ALREADY GENERATED? (SAFE)
       =============================== */
    const existing = await FeeVoucher.find({
      campusId: user.campusId,
      classId,
      month: monthNum,
      year: yearNum,
    }).lean();

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: true,
          alreadyGenerated: true,
          vouchers: existing,
        },
        { status: 200 }
      );
    }

    /* ===============================
       NORMAL FLOW
       =============================== */
    const issueDate = new Date(yearNum, monthNum - 1, 1);
    const dueDate = new Date(yearNum, monthNum - 1, 10);

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

    session = await mongoose.startSession();
    session.startTransaction();

    let counter = 1;

    for (const s of students) {
      const previous = await FeeVoucher.findOne({
        campusId: user.campusId,
        studentId: s.studentId,
        status: { $ne: "paid" },
        $or: [
          { year: { $lt: yearNum } },
          { year: yearNum, month: { $lt: monthNum } },
        ],
      })
        .sort({ year: -1, month: -1 })
        .session(session);

      const arrearsAmount = previous
        ? (previous.totals?.baseAmount || 0) +
        (previous.totals?.lateAmount || 0)
        : 0;

      // 🔥 CORRECT CALCULATION
      const monthlyAmount =
        structure.monthlyFee +
        Number(s.extraFee || 0) -
        Number(s.discount || 0);

      const baseAmount = monthlyAmount + arrearsAmount;
      const lateAmount = structure.lateFee || 0;

      await FeeVoucher.create(
        [
          {
            campusId: user.campusId,
            voucherNo: `${yearNum}${monthNum}-${counter
              .toString()
              .padStart(4, "0")}`,
            studentId: s.studentId,
            classId,
            month: monthNum,
            year: yearNum,
            issueDate,
            dueDate,

            fees: {
              monthlyFee: structure.monthlyFee,
              paperFee: Number(s.extraFee || 0),
              arrears: arrearsAmount,
              lateFee: lateAmount,
            },

            // ✅ SOURCE OF TRUTH
            totals: {
              baseAmount,
              lateAmount,
            },

            status: "unpaid",
          },
        ],
        { session }
      );

      await StudentFeeAdjustment.findOneAndUpdate(
        {
          campusId: user.campusId,
          studentId: s.studentId,
          month: monthNum,
          year: yearNum,
        },
        {
          classId,
          discount: Number(s.discount || 0),
          extraFee: Number(s.extraFee || 0),
        },
        { upsert: true, session }
      );

      counter++;
    }

    await FeeCycle.findOneAndUpdate(
      { campusId: user.campusId, month: monthNum, year: yearNum },
      { status: "generated", generatedBy: user._id },
      { upsert: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { success: true, alreadyGenerated: false },
      { status: 201 }
    );
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    console.error("GENERATE FINAL ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
