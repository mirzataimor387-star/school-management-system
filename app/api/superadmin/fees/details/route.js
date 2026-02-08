import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import FeeVoucher from "@/models/FeeVoucher";
import FeePayment from "@/models/FeePayment";

/*
=====================================================
SUPER ADMIN – FEES DETAILS (AUDIT VIEW)

✔ Exact date & time
✔ Voucher + Payment joined
✔ Month safe (January or 1)
✔ Year safe
✔ Pagination ready
=====================================================
*/

export async function GET(request) {
  try {
    /* ===============================
       DB + AUTH
    =============================== */
    await dbConnect();

    const user = await getAuthUser(request);
    if (!user || user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    /* ===============================
       QUERY PARAMS
    =============================== */
    const { searchParams } = new URL(request.url);

    const campusId = searchParams.get("campusId");
    const classId = searchParams.get("classId");
    const monthParam = searchParams.get("month"); // "January" or "1"
    const year = Number(searchParams.get("year")) || new Date().getFullYear();

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    if (!campusId || !classId || !monthParam) {
      return NextResponse.json(
        { success: false, message: "campusId, classId and month required" },
        { status: 400 }
      );
    }

    /* ===============================
       MONTH NORMALIZATION
    =============================== */
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    let monthNum;
    if (!isNaN(monthParam)) {
      monthNum = Number(monthParam);
    } else {
      monthNum = months.indexOf(monthParam) + 1;
    }

    if (!monthNum || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { success: false, message: "Invalid month" },
        { status: 400 }
      );
    }

    /* ===============================
       READ VOUCHERS
    =============================== */
    const vouchers = await FeeVoucher.find({
      campusId,
      classId,
      month: monthNum,
      year,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const voucherIds = vouchers.map(v => v._id);

    /* ===============================
       READ PAYMENTS
    =============================== */
    const payments = await FeePayment.find({
      voucherId: { $in: voucherIds },
    }).lean();

    /* ===============================
       MAP PAYMENTS BY VOUCHER
    =============================== */
    const paymentsByVoucher = {};
    for (const p of payments) {
      if (!paymentsByVoucher[p.voucherId]) {
        paymentsByVoucher[p.voucherId] = [];
      }
      paymentsByVoucher[p.voucherId].push(p);
    }

    /* ===============================
       BUILD RESPONSE
    =============================== */
    const rows = vouchers.map(v => {
      const vPayments = paymentsByVoucher[v._id] || [];

      return {
        voucherNo: v.voucherNo,
        studentId: v.studentId,
        status: v.status,
        feeAmount:
          (v.totals?.baseAmount || 0) +
          (v.totals?.lateAmount || 0),
        voucherCreatedAt: v.createdAt,
        payments: vPayments.map(p => ({
          amount: p.amount,
          method: p.method,
          receivedAt: p.receivedAt,
          entryAt: p.createdAt,
          receivedBy: p.receivedBy,
        })),
      };
    });

    /* ===============================
       RESPONSE
    =============================== */
    return NextResponse.json({
      success: true,
      meta: {
        page,
        limit,
        count: rows.length,
        month: monthNum,
        year,
      },
      rows,
    });

  } catch (err) {
    console.error("SUPERADMIN FEES DETAILS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
