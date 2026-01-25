import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

export async function POST(req) {
    await dbConnect();

    const { classId, month } = await req.json();
    // month example: "2026-01"

    const attendances = await Attendance.find({
        classId,
        date: { $regex: `^${month}` },
    });

    const students = await Student.find({
        classId,
        status: "active",
    }).sort({ rollNumber: 1 });

    const report = students.map((student) => {
        let present = 0;
        let absent = 0;
        let leave = 0;

        attendances.forEach((att) => {
            const record = att.records.find(
                (r) => r.studentId.toString() === student._id.toString()
            );

            if (record) {
                if (record.status === "present") present++;
                if (record.status === "absent") absent++;
                if (record.status === "leave") leave++;
            }
        });

        const total = present + absent + leave;
        const percentage =
            total === 0 ? 0 : Math.round((present / total) * 100);

        return {
            rollNumber: student.rollNumber,
            name: student.name,
            present,
            absent,
            leave,
            percentage,
        };
    });

    return NextResponse.json({ report });
}
