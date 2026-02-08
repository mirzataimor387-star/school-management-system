import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import FeePayment from "@/models/FeePayment";
import ClassFeeSummary from "@/models/ClassFeeSummary";
import { getAuthUser } from "@/utils/getAuthUser";

/*
=====================================================
RECEIVE PAYMENT API (FINAL – PRODUCTION SAFE)

✔ FIFO (oldest vouchers first)
✔ Partial & full payments
✔ No double counting
✔ Arrears auto-removed
✔ ClassFeeSummary synced
✔ Transaction safe
✔ 🔥 receivedAt FIXED (server time only)
=====================================================
*/

export async function POST(req) {
  let session;

  try {
    /* ===============================
       DB + AUTH
    =============================== */
    await dbConnect();

    const user = await getAuthUser(req);
    if (!user || user.role !== "principal") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ===============================
       INPUT
       ⚠️ receivedAt intentionally ignored
       Server time is source of truth
    =============================== */
    const { voucherId, amount, method } = await req.json();

    if (
      !voucherId ||
      !mongoose.Types.ObjectId.isValid(voucherId) ||
      !amount ||
      Number(amount) <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    /* ===============================
       START TRANSACTION
    =============================== */
    session = await mongoose.startSession();
    session.startTransaction();

    /* ===============================
       BASE VOUCHER
    =============================== */
    const baseVoucher = await FeeVoucher.findOne({
      _id: voucherId,
      campusId: user.campusId,
    }).session(session);

    if (!baseVoucher) {
      throw new Error("Voucher not found");
    }

    let remainingAmount = Number(amount);
    const paidVoucherIds = [];

    /* ===============================
       LOAD UNPAID / PARTIAL (FIFO)
    =============================== */
    const unpaidVouchers = await FeeVoucher.find({
      campusId: baseVoucher.campusId,
      studentId: baseVoucher.studentId,
      status: { $in: ["unpaid", "partial"] },
    })
      .sort({ year: 1, month: 1 })
      .session(session);

    /* ===============================
       PAYMENT LOOP
    =============================== */
    for (const v of unpaidVouchers) {
      if (remainingAmount <= 0) break;

      const payable =
        (v.totals?.baseAmount || 0) +
        (v.totals?.lateAmount || 0);

      const alreadyReceived = v.received || 0;
      const pending = payable - alreadyReceived;

      if (pending <= 0) continue;

      const adjustAmount = Math.min(pending, remainingAmount);

      /* ---- UPDATE VOUCHER ---- */
      v.received = alreadyReceived + adjustAmount;
      remainingAmount -= adjustAmount;

      if (v.received >= payable) {
        v.status = "paid";
        paidVoucherIds.push(v._id.toString());
      } else {
        v.status = "partial";
      }

      await v.save({ session });

      /* ---- PAYMENT RECORD ----
         🔒 receivedAt FIX:
         Always use server time (UTC)
         Never trust client date input
      -------------------------------- */
      await FeePayment.create(
        [
          {
            campusId: v.campusId,
            voucherId: v._id,
            studentId: v.studentId,
            amount: adjustAmount,
            method: method || "cash",
            receivedAt: new Date(), // ✅ FIXED HERE
            receivedBy: user._id || user.id || user.user?._id,
          },
        ],
        { session }
      );

      /* ===============================
         CLASS FEE SUMMARY UPDATE
         (MOST IMPORTANT PART)
      =============================== */
      await ClassFeeSummary.findOneAndUpdate(
        {
          campusId: v.campusId,
          classId: v.classId,
          month: v.month, // NUMBER (1–12)
          year: v.year,
        },
        {
          $inc: {
            totalReceived: adjustAmount,
            totalPending: -adjustAmount,
          },
        },
        {
          upsert: true,
          session,
        }
      );
    }

    /* ===============================
       🔥 ARREARS FIX
       Clear next month arrears
    =============================== */
    for (const paidId of paidVoucherIds) {
      const paidVoucher = unpaidVouchers.find(
        (v) => v._id.toString() === paidId
      );
      if (!paidVoucher) continue;

      const nextVoucher = await FeeVoucher.findOne({
        campusId: paidVoucher.campusId,
        studentId: paidVoucher.studentId,
        $or: [
          {
            year: paidVoucher.year,
            month: paidVoucher.month + 1,
          },
          {
            year: paidVoucher.year + 1,
            month: 1,
          },
        ],
      }).session(session);

      if (nextVoucher && nextVoucher.fees?.arrears > 0) {
        nextVoucher.fees.arrears = 0;

        nextVoucher.totals.baseAmount =
          (nextVoucher.fees.monthlyFee || 0) +
          (nextVoucher.fees.paperFee || 0);

        nextVoucher.received = Math.min(
          nextVoucher.received || 0,
          nextVoucher.totals.baseAmount
        );

        if (nextVoucher.received === 0) {
          nextVoucher.status = "unpaid";
        } else if (nextVoucher.received < nextVoucher.totals.baseAmount) {
          nextVoucher.status = "partial";
        } else {
          nextVoucher.status = "paid";
        }

        await nextVoucher.save({ session });
      }
    }

    /* ===============================
       COMMIT
    =============================== */
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: "Payment adjusted successfully",
    });

  } catch (error) {
    if (session) await session.abortTransaction();

    console.error("RECEIVE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
