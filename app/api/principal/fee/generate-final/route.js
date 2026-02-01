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
    // ===============================
    // DB CONNECT
    // ===============================
    await dbConnect();

    // ===============================
    // AUTH
    // ===============================
    const user = await getAuthUser();

    if (!user || user.role !== "principal") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // ===============================
    // BODY
    // ===============================
    const body = await req.json();

    const {
      classId,
      students = [],
      month,
      year,
    } = body;

    // ===============================
    // VALIDATION
    // ===============================
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        {
          success: false,
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
          message: "Invalid month or year",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No students provided for fee generation",
        },
        { status: 400 }
      );
    }

    // ===============================
    // SAFE DATES
    // ===============================
    const issueDate = new Date(yearNum, monthNum - 1, 1);
    const dueDate = new Date(yearNum, monthNum - 1, 10);

    if (isNaN(issueDate.getTime()) || isNaN(dueDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid issue or due date",
        },
        { status: 400 }
      );
    }

    // ===============================
    // FEE CYCLE LOCK
    // ===============================
    let cycle = await FeeCycle.findOne({
      campusId: user.campusId,
      month: monthNum,
      year: yearNum,
    });

    if (!cycle) {
      cycle = await FeeCycle.create({
        campusId: user.campusId,
        month: monthNum,
        year: yearNum,
        issueDate,
        dueDate,
        status: "draft",
        generatedBy: user._id,
      });
    }

    if (cycle.status !== "draft") {
      return NextResponse.json(
        {
          success: false,
          message: "Fee already generated for this month",
        },
        { status: 409 }
      );
    }

    // ===============================
    // FEE STRUCTURE
    // ===============================
    const structure = await FeeStructure.findOne({
      campusId: user.campusId,
      classId,
    });

    if (!structure) {
      return NextResponse.json(
        {
          success: false,
          message: "Fee structure not found for this class",
        },
        { status: 404 }
      );
    }

    // ===============================
    // TRANSACTION
    // ===============================
    session = await mongoose.startSession();
    session.startTransaction();

    let counter = 1;

    for (const s of students) {
      if (!mongoose.Types.ObjectId.isValid(s.studentId)) {
        throw new Error("Invalid studentId detected");
      }

      const previous = await FeeVoucher.findOne({
        campusId: user.campusId,
        studentId: s.studentId,
        status: "unpaid",
        $or: [
          { year: { $lt: yearNum } },
          { year: yearNum, month: { $lt: monthNum } },
        ],
      })
        .sort({ year: -1, month: -1 })
        .session(session);

      const arrears = previous ? previous.feeAfterDueDate : 0;

      const payable =
        structure.monthlyFee +
        Number(s.extraFee || 0) -
        Number(s.discount || 0) +
        arrears;

      const voucherNo = `${yearNum}${monthNum}-${counter
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
            issueDate,
            dueDate,

            carriedFromVoucherId: previous?._id || null,

            fees: {
              monthlyFee: structure.monthlyFee,
              paperFee: Number(s.extraFee || 0),
              arrears,
              lateFee: structure.lateFee || 100,
            },

            payableWithinDueDate: payable,
            feeAfterDueDate:
              payable + (structure.lateFee || 100),
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

    cycle.status = "generated";
    await cycle.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        success: true,
        message: "Fee vouchers generated successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    console.error("GENERATE FEE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
