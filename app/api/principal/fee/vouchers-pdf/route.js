import dbConnect from "@/utils/connectdb";
export async function GET(req) {
    try {
        await dbConnect();

        // 🔴 TEMP (testing ke liye) — baad me auth se aayega
        const principalCampusId = "6980092c4d3c681ab1fe6c18";

        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");
        const month = Number(searchParams.get("month"));
        const year = Number(searchParams.get("year"));

        if (!classId || !month || !year) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Missing parameters (classId, month, year required)",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const vouchers = await FeeVoucher.find({
            campusId: principalCampusId,
            classId,
            month,
            year,
        }).populate("studentId");

        if (!vouchers.length) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No vouchers found",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // ✅ VOUCHERS LIST RESPONSE
        const data = vouchers.map(v => ({
            voucherId: v._id,
            voucherNo: v.voucherNo,
            student: {
                id: v.studentId?._id,
                name: v.studentId?.name || "-",
                rollNo: v.studentId?.rollNumber || "-",
            },
            classId: v.classId,
            month: v.month,
            year: v.year,
            fees: {
                monthlyFee: v.fees?.monthlyFee || 0,
                lateFee: v.fees?.lateFee || 0,
                arrears: v.fees?.arrears || 0,
            },
            total:
                (v.totals?.baseAmount || 0) +
                (v.totals?.lateAmount || 0),
            dueDate: v.dueDate,
            status: v.status, // paid / unpaid
            received: v.received,
            createdAt: v.createdAt,
        }));

        return new Response(
            JSON.stringify({
                success: true,
                count: data.length,
                vouchers: data,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("VOUCHERS LIST API ERROR:", err);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
