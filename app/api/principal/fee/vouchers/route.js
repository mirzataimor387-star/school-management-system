import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import FeeVoucher from "@/models/FeeVoucher";
import FeePayment from "@/models/FeePayment";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";
import Student from "@/models/Student"; // ✅ MUST
import Class from "@/models/Class";     // (optional but recommended)

import { getAuthUser } from "@/utils/getAuthUser";


/*
=====================================================
FINAL VOUCHER LIST API (SINGLE SOURCE OF TRUTH)

✔ Discount applied
✔ Extra fee applied
✔ Payments respected
✔ Pending / Status correct
✔ Matches Preview + Generate + PDF
✔ Late fee ignored (school policy)
=====================================================
*/

export async function GET(req) {
  try {
    await dbConnect();

    const user = await getAuthUser(req);
    if (!user || user.role !== "principal") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!classId || !month || !year) {
      return NextResponse.json(
        { success: false, message: "Missing filters" },
        { status: 400 }
      );
    }

    /* ===============================
       LOAD VOUCHERS
       =============================== */
    const vouchers = await FeeVoucher.find({
      campusId: user.campusId,
      classId,
      month,
      year,
    })
      .populate("studentId", "name rollNumber")
      .populate("classId", "className")
      .lean();

    if (!vouchers.length) {
      return NextResponse.json({ success: true, vouchers: [] });
    }

    /* ===============================
       LOAD PAYMENTS
       =============================== */
    const voucherIds = vouchers.map(v => v._id);

    const payments = await FeePayment.find({
      voucherId: { $in: voucherIds },
    }).lean();

    const paymentMap = {};
    for (const p of payments) {
      const id = p.voucherId.toString();
      if (!paymentMap[id]) paymentMap[id] = [];
      paymentMap[id].push(p);
    }

    /* ===============================
       NORMALIZE (🔥 REAL LOGIC)
       =============================== */
    const normalized = [];

    for (const v of vouchers) {
      /* ---- DISCOUNT / EXTRA ---- */
      const adjustment = await StudentFeeAdjustment.findOne({
        campusId: user.campusId,
        studentId: v.studentId?._id,
        classId,
        month,
        year,
      }).lean();

      const discount = adjustment?.discount || 0;
      const extraFee = adjustment?.extraFee || 0;

      /* ---- PAYABLE ---- */
      const payable = Math.max(
        0,
        (v.fees?.monthlyFee || 0) +
          (v.fees?.arrears || 0) +
          extraFee -
          discount
      );

      /* ---- RECEIVED ---- */
      const received = (paymentMap[v._id.toString()] || []).reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const pending = Math.max(0, payable - received);

      let status = "unpaid";
      if (received >= payable && payable > 0) status = "paid";
      else if (received > 0) status = "partial";

      normalized.push({
        _id: v._id,
        studentId: v.studentId,
        classId: v.classId,
        month: v.month,
        year: v.year,

        totalPayable: payable,
        received,
        pending,
        status,
      });
    }

    return NextResponse.json({
      success: true,
      vouchers: normalized,
    });

  } catch (err) {
    console.error("VOUCHER LIST ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
