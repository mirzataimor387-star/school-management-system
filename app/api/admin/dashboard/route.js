import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import User from "@/models/User";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Attendance from "@/models/Attendance";

export async function GET() {
    try {
        await dbConnect();

        const today = new Date().toISOString().split("T")[0];

        const totalTeachers = await User.countDocuments({
            role: "teacher",
        });

        const totalStudents = await Student.countDocuments({
            status: "active",
        });

        const totalClasses = await Class.countDocuments();

        const attendanceToday = await Attendance.find({
            date: today,
        });

        let present = 0;
        let total = 0;
        let absentStudents = [];

        attendanceToday.forEach((att) => {
            if (!att.records) return;

            att.records.forEach((r) => {
                total++;

                if (r.status === "present") present++;
                if (r.status === "absent") {
                    absentStudents.push(r.studentId);
                }
            });
        });

        const percentage =
            total === 0 ? 0 : Math.round((present / total) * 100);

        return NextResponse.json({
            totalTeachers,
            totalStudents,
            totalClasses,
            attendancePercentage: percentage,
            absentCount: absentStudents.length,
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);

        return NextResponse.json(
            {
                totalTeachers: 0,
                totalStudents: 0,
                totalClasses: 0,
                attendancePercentage: 0,
                absentCount: 0,
                buildSafe: true,
            },
            { status: 200 }
        );
    }
}
