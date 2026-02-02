import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import Attendance from "@/models/Attendance";

export async function GET(req) {
    try {
        await dbConnect();

        const authUser = await getAuthUser(req);

        if (!authUser || authUser.role !== "teacher") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const attendance = await Attendance.find({
            markedBy: authUser.id,
        })
            .populate("classId", "className section")
            .sort({ createdAt: -1 });

        const formatted = attendance.map(a => {
            const total = a.records.length;

            const presentOnly = a.records.filter(
                r => r.status === "present"
            ).length;

            const late = a.records.filter(
                r => r.status === "late"
            ).length;

            const present = presentOnly + late; // late counted as present

            const absent = a.records.filter(
                r => r.status === "absent"
            ).length;

            const leave = a.records.filter(
                r => r.status === "leave"
            ).length;

            return {
                ...a.toObject(),
                summary: {
                    total,
                    present,
                    absent,
                    leave,
                    late,
                },
            };
        });

        return NextResponse.json({ attendance: formatted });

    } catch (error) {
        console.error("ATTENDANCE HISTORY ERROR:", error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
