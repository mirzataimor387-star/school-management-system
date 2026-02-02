import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Attendance from "@/models/Attendance";
import { getAuthUser } from "@/utils/getAuthUser";

export async function PATCH(request) {
    try {
        await dbConnect();

        const authUser = await getAuthUser(request);

        if (!authUser || authUser.role !== "teacher") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { attendanceId, studentId, status } = await request.json();

        await Attendance.updateOne(
            {
                _id: attendanceId,
                "records.studentId": studentId,
            },
            {
                $set: {
                    "records.$.status": status,
                },
            }
        );

        return NextResponse.json({ message: "Attendance updated" });

    } catch (err) {
        console.error("ATTENDANCE UPDATE ERROR:", err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
