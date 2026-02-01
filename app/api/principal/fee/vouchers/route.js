import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

// ✅ MUST import populated models
import FeeVoucher from "@/models/FeeVoucher";
import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET(req) {
  try {
    // ===============================
    // DB CONNECT
    // ===============================
    await dbConnect();

    // ===============================
    // AUTH
    // ===============================
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        {
          success: false,
          vouchers: [],
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // ===============================
    // FILTERS (optional)
    // ===============================
    const { searchParams } = new URL(req.url);

    const classId = searchParams.get("classId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const query = {
      campusId: authUser.campusId,
    };

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      query.classId = classId;
    }

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    // ===============================
    // FETCH VOUCHERS
    // ===============================
    const vouchers = await FeeVoucher.find(query)
      .populate({
        path: "studentId",
        select: "name rollNumber",
      })
      .populate({
        path: "classId",
        select: "className",
      })
      .sort({ createdAt: -1 })
      .lean();

    // ===============================
    // RESPONSE
    // ===============================
    return NextResponse.json(
      {
        success: true,
        total: vouchers.length,
        vouchers,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("FEE VOUCHER LIST API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        vouchers: [],
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
