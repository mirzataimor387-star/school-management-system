import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import FeeVoucher from "@/models/FeeVoucher";

// 🔥 REQUIRED for populate
import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET(request) {
  try {
    await dbConnect();

    const user = await getAuthUser(request);

    if (!user || user.role !== "superadmin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");

    const vouchers = await FeeVoucher.find({ campusId })
      .populate("studentId", "name")
      .populate("classId", "className")
      .sort({ year: -1, month: -1 });

    return NextResponse.json({
      success: true,
      fees: vouchers,
    });

  } catch (err) {
    console.error("SUPERADMIN FEES ERROR:", err);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
