import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import FeePayment from "@/models/FeePayment";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(req) {
  try {
    await dbConnect();

    const user = await getAuthUser(req);
    if (!user || user.role !== "principal") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { voucherId, amount, method, receivedAt } = await req.json();

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

    const voucher = await FeeVoucher.findOne({
      _id: voucherId,
      campusId: user.campusId,
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: "Voucher not found" },
        { status: 404 }
      );
    }

    await FeePayment.create({
      campusId: voucher.campusId,
      voucherId: voucher._id,
      studentId: voucher.studentId,
      amount: Number(amount),
      method: method || "cash",
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),

      // 🔥 THIS IS THE FIX
      receivedBy: user.id || user.user?._id,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("RECEIVE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
