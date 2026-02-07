import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import FeeVoucher from "@/models/FeeVoucher";

export async function GET(request) {
    try {
        await dbConnect();

        const user = await getAuthUser(request);
        if (!user || user.role !== "superadmin") {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const campusId = searchParams.get("campusId");

        if (!campusId) {
            return NextResponse.json(
                { success: false, message: "CampusId required" },
                { status: 400 }
            );
        }

        const vouchers = await FeeVoucher.find({ campusId });

        let totalFee = 0;
        let totalReceived = 0;

        vouchers.forEach(v => {
            totalFee += v.totalAmount || 0;
            totalReceived += v.paidAmount || 0;
        });

        return NextResponse.json({
            success: true,
            summary: {
                totalVouchers: vouchers.length,
                totalFee,
                totalReceived,
                totalPending: totalFee - totalReceived,
            },
        });

    } catch (err) {
        console.error("FEES API ERROR:", err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
