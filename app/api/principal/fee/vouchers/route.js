import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import FeePayment from "@/models/FeePayment";
import Student from "@/models/Student";
import Class from "@/models/Class";
import { getAuthUser } from "@/utils/getAuthUser";
import { calculateVoucherTotals } from "@/utils/feeCalculations";

export async function GET(req) {
  try {
    await dbConnect();

    const user = await getAuthUser(req);
    if (!user || user.role !== "principal") {
      return NextResponse.json({ success: false }, { status: 401 });
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

    const normalized = vouchers.map(v => {
      const totals = calculateVoucherTotals(
        v,
        paymentMap[v._id.toString()] || []
      );

      return {
        _id: v._id,
        studentId: v.studentId,
        classId: v.classId,
        month: v.month,
        year: v.year,

        totalPayable: totals.payable,
        received: totals.received,
        pending: totals.pending,
        status: totals.status,
      };
    });

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
