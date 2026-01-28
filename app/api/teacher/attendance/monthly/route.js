import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET(request) {
    try {
        await dbConnect();

        const authUser = await getAuthUser();

        if (!authUser || authUser.role !== "teacher") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        const classId = searchParams.get("classId");
        const session = searchParams.get("session");
        const month = searchParams.get("month");

        if (!classId || !session || !month) {
            return NextResponse.json(
                { message: "Missing parameters" },
                { status: 400 }
            );
        }

        const cls = await Class.findOne({
            _id: classId,
            classTeacher: authUser.id,
        });

        if (!cls) {
            return NextResponse.json(
                { message: "Not your class" },
                { status: 403 }
            );
        }

        // ✅ FIXED: remove session filter
        const students = await Student.find({
            classId,
        });

        const startDate = `${month}-01`;
        const endDate = `${month}-31`;

        const attendanceList = await Attendance.find({
            classId,
            session,
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        const report = students.map((stu) => {
            let present = 0;
            let late = 0;
            let absent = 0;
            let leave = 0;

            attendanceList.forEach((day) => {
                const record = day.records.find(
                    (r) => r.studentId.toString() === stu._id.toString()
                );

                if (!record) return;

                if (record.status === "present") present++;
                if (record.status === "late") late++;
                if (record.status === "absent") absent++;
                if (record.status === "leave") leave++;
            });

            const totalDays = attendanceList.length;
            const effectivePresent = present + late;

            const percentage =
                totalDays === 0
                    ? 0
                    : Math.round((effectivePresent / totalDays) * 100);

            return {
                studentId: stu._id,
                name: stu.name,
                rollNumber: stu.rollNumber,
                present,
                late,
                absent,
                leave,
                percentage,
            };
        });

        return NextResponse.json({ report });

    } catch (error) {
        console.log("MONTHLY ATTENDANCE ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
