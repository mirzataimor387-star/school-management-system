import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import Student from "@/models/Student";
import Class from "@/models/Class";

import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(request) {
    try {
        await dbConnect();

        // ===============================
        // AUTH ✅ FIXED
        // ===============================
        const authUser = await getAuthUser(request);

        // 🔐 principal only
        if (!authUser || authUser.role !== "principal") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // ===============================
        // BODY
        // ===============================
        const {
            voucherId,
            receivedAmount,
            receivedDate,
        } = await request.json();

        // ===============================
        // VALIDATION
        // ===============================
        if (!voucherId || !receivedAmount || !receivedDate) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(voucherId)) {
            return NextResponse.json(
                { success: false, message: "Invalid voucher id" },
                { status: 400 }
            );
        }

        const voucher = await FeeVoucher.findById(voucherId);

        if (!voucher) {
            return NextResponse.json(
                { success: false, message: "Voucher not found" },
                { status: 404 }
            );
        }

        // ===============================
        // PAYMENT LOGIC
        // ===============================
        const previousPaid = voucher.receivedAmount || 0;
        const totalPaid = previousPaid + Number(receivedAmount);

        voucher.receivedAmount = totalPaid;
        voucher.receivedDate = new Date(receivedDate);

        // auto status
        if (totalPaid >= voucher.payableWithinDueDate) {
            voucher.status = "paid";
        } else {
            voucher.status = "unpaid";
        }

        await voucher.save();

        return NextResponse.json({
            success: true,
            message: "Fee received successfully",
            voucher,
        });

    } catch (error) {
        console.error("FEE RECEIVE API ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
