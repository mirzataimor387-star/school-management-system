// app/api/principal/fee/pending-last-month/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET(req) {
  await dbConnect();
  const user = await getAuthUser(req);

  if (!user || user.role !== "principal") {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  // 🔥 previous months only
  const vouchers = await FeeVoucher.find({
    campusId: user.campusId,
    status: { $in: ["unpaid", "partial"] },
    $or: [
      { year: { $lt: year } },
      { year, month: { $lt: month } },
    ],
  })
    .populate("studentId", "name")
    .lean();

  const result = vouchers.map(v => {
    const payable =
      (v.totals?.baseAmount || 0) +
      (v.totals?.lateAmount || 0);

    const pending = payable - (v.received || 0);

    return {
      voucherId: v._id,
      studentId: v.studentId._id,
      studentName: v.studentId.name,
      month: v.month,
      year: v.year,
      pending,
    };
  });

  return NextResponse.json({
    success: true,
    pending: result.filter(p => p.pending > 0),
  });
}
