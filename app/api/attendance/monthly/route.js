import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);

        const classId = searchParams.get("classId");
        const month = searchParams.get("month"); // YYYY-MM

        if (!classId || !month) {
            return NextResponse.json(
                { message: "classId and month required" },
                { status: 400 }
            );
        }

        // 1️⃣ date range
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        // 2️⃣ students of class
        const students = await Student.find({
            classId,
            status: "active",
        }).select("_id name rollNo");

        // 3️⃣ attendance records
        const attendanceRecords = await Attendance.find({
            classId,
            date: {
                $gte: startDate,
                $lt: endDate,
            },
        });

        // 4️⃣ group attendance by student
        const attendanceMap = {};

        attendanceRecords.forEach((rec) => {
            const id = rec.student.toString();

            if (!attendanceMap[id]) {
                attendanceMap[id] = {
                    present: 0,
                    absent: 0,
                    leave: 0,
                    total: 0,
                };
            }

            attendanceMap[id][rec.status]++;
            attendanceMap[id].total++;
        });

        // 5️⃣ build report
        const report = students.map((student) => {
            const stats = attendanceMap[student._id.toString()] || {
                present: 0,
                absent: 0,
                leave: 0,
                total: 0,
            };

            const percentage =
                stats.total === 0
                    ? 0
                    : Math.round((stats.present / stats.total) * 100);

            return {
                studentId: student._id,
                name: student.name,
                rollNo: student.rollNo,
                present: stats.present,
                absent: stats.absent,
                leave: stats.leave,
                totalDays: stats.total,
                percentage,
            };
        });

        return NextResponse.json({
            classId,
            month,
            report,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: err.message },
            { status: 500 }
        );
    }
}
