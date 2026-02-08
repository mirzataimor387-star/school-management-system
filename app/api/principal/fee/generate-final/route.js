import mongoose from "mongoose";
import { NextResponse } from "next/server";

import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import FeeStructure from "@/models/FeeStructure";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";
import FeeCycle from "@/models/FeeCycle";
import VoucherCounter from "@/models/VoucherCounter";
import ClassFeeSummary from "@/models/ClassFeeSummary"; // ✅ ADDED
import { getAuthUser } from "@/utils/getAuthUser";

/* ===============================
   SAFE COUNTER
=============================== */
async function getVoucherCounter({ campusId, year, month, session }) {
  return await VoucherCounter.findOneAndUpdate(
    { campusId, year, month },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
}

/*
=====================================================
FINAL GENERATE API (PRODUCTION SAFE)

✔ Preview match
✔ Discount locked
✔ Extra fee locked
✔ Late fee OFF
✔ Arrears correct
✔ 🔥 ClassFeeSummary auto build (ADDED)
=====================================================
*/

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

    if (!classId || !monthNum || !yearNum) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    /* ===============================
       ALREADY GENERATED CHECK
    =============================== */
    const exists = await FeeVoucher.findOne({
      campusId: user.campusId,
      classId,
      month: monthNum,
      year: yearNum,
    });

    if (exists) {
      return NextResponse.json({
        success: true,
        alreadyGenerated: true,
      });
    }

    const structure = await FeeStructure.findOne({
      campusId: user.campusId,
      classId,
    });

    session = await mongoose.startSession();
    session.startTransaction();

    /* =================================================
       VOUCHER GENERATION (UNCHANGED LOGIC)
    ================================================= */
    for (const s of students) {
      const prev = await FeeVoucher.findOne({
        campusId: user.campusId,
        studentId: s.studentId,
        status: { $in: ["unpaid", "partial"] },
        $or: [
          { year: { $lt: yearNum } },
          { year: yearNum, month: { $lt: monthNum } },
        ],
      })
        .sort({ year: -1, month: -1 })
        .session(session);

      const lastPayable = prev
        ? (prev.totals?.baseAmount || 0) +
          (prev.totals?.lateAmount || 0)
        : 0;

      const arrears = prev
        ? Math.max(0, lastPayable - (prev.received || 0))
        : 0;

      const monthly =
        structure.monthlyFee +
        Number(s.extraFee || 0) -
        Number(s.discount || 0);

      const baseAmount = monthly + arrears;

      const counter = await getVoucherCounter({
        campusId: user.campusId,
        year: yearNum,
        month: monthNum,
        session,
      });

      const voucherNo = `${yearNum}${monthNum}-${counter.seq
        .toString()
        .padStart(4, "0")}`;

      await FeeVoucher.create(
        [
          {
            campusId: user.campusId,
            voucherNo,
            studentId: s.studentId,
            classId,
            month: monthNum,
            year: yearNum,
            issueDate: new Date(yearNum, monthNum - 1, 1),
            dueDate: new Date(yearNum, monthNum - 1, 10),

            fees: {
              monthlyFee: structure.monthlyFee,
              paperFee: Number(s.extraFee || 0),
              arrears,
              lateFee: 0,
            },

            totals: {
              baseAmount,
              lateAmount: 0,
            },
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
    }

    /* =====================================================
       🔥 CLASS FEE SUMMARY BUILD (NEW FEATURE)
       - Runs once after vouchers are generated
       - Single source of truth for Super Admin
       - Receive API will only INC / DEC this
    ===================================================== */
    const vouchers = await FeeVoucher.find({
      campusId: user.campusId,
      classId,
      month: monthNum,
      year: yearNum,
    }).session(session);

    const totalFee = vouchers.reduce(
      (sum, v) =>
        sum +
        (v.totals?.baseAmount || 0) +
        (v.totals?.lateAmount || 0),
      0
    );

    await ClassFeeSummary.findOneAndUpdate(
      {
        campusId: user.campusId,
        classId,
        month: monthNum, // NUMBER (1–12)
        year: yearNum,
      },
      {
        totalFee,
        totalPending: totalFee,
        totalReceived: 0,
        totalVouchers: vouchers.length,
      },
      { upsert: true, session }
    );

    /* ===============================
       FEE CYCLE MARK GENERATED
    =============================== */
    await FeeCycle.findOneAndUpdate(
      { campusId: user.campusId, month: monthNum, year: yearNum },
      { status: "generated", generatedBy: user._id },
      { upsert: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true });

  } catch (err) {
    if (session) await session.abortTransaction();
    console.error("GENERATE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
