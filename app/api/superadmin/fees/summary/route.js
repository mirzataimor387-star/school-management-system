import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import FeeVoucher from "@/models/FeeVoucher";
import Class from "@/models/Class"; // 🔥 REQUIRED

export async function GET(request) {
    await dbConnect();

    const user = await getAuthUser(request);
    if (!user || user.role !== "superadmin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    const campusId = searchParams.get("campusId");
    const classId = searchParams.get("classId");
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    // 🔥 POPULATE CLASS
    const vouchers = await FeeVoucher.find({
        campusId,
        classId,
        month,
        year,
    }).populate("classId", "className section");

    const summary = {};

    vouchers.forEach(v => {
        const cls = v.classId;

        if (!summary[cls._id]) {
            summary[cls._id] = {
                classId: cls._id,
                className: `${cls.className} (${cls.section})`,
                totalStudents: 0,
                paidCount: 0,
                unpaidCount: 0,
                totalAmount: 0,
                collected: 0,
            };
        }

        summary[cls._id].totalStudents++;
        summary[cls._id].totalAmount += v.payableWithinDueDate;
        summary[cls._id].collected += v.receivedAmount || 0;

        if (v.status === "paid") summary[cls._id].paidCount++;
        else summary[cls._id].unpaidCount++;
    });

    const result = Object.values(summary).map(r => ({
        ...r,
        pending: r.totalAmount - r.collected,
    }));

    return NextResponse.json({ summary: result });
}
