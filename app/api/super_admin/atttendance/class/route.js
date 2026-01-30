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

        // 🔒 only super admin
        if (!authUser || authUser.role !== "super-admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        const campusId = searchParams.get("campusId");
        const classId = searchParams.get("classId");
        const session = searchParams.get("session");
        const date = searchParams.get("date");

        if (!campusId || !classId || !session || !date) {
            return NextResponse.json(
                { message: "Missing parameters" },
                { status: 400 }
            );
        }

        // ✅ verify class exists
        const cls = await Class.findOne({
            _id: classId,
            campusId,
            session,
        });

        if (!cls) {
            return NextResponse.json(
                { message: "Class not found" },
                { status: 404 }
            );
        }

        // ✅ get attendance
        const attendance = await Attendance.findOne({
            campusId,
            classId,
            session,
            date,
        });

        // get all students
        const students = await Student.find({
            classId,
            session,
        }).sort({ rollNumber: 1 });

        if (!attendance) {
            return NextResponse.json({
                marked: false,
                students,
            });
        }

        // 🔢 summary
        let present = 0;
        let late = 0;
        let absent = 0;
        let leave = 0;

        attendance.records.forEach((r) => {
            if (r.status === "present") present++;
            if (r.status === "late") late++;
            if (r.status === "absent") absent++;
            if (r.status === "leave") leave++;
        });

        return NextResponse.json({
            marked: true,
            summary: {
                total: students.length,
                present,
                late,
                absent,
                leave,
            },
            students: students.map((s) => {
                const rec = attendance.records.find(
                    (r) => r.studentId.toString() === s._id.toString()
                );

                return {
                    studentId: s._id,
                    rollNumber: s.rollNumber,
                    name: s.name,
                    status: rec?.status || "—",
                };
            }),
        });

    } catch (err) {
        console.log("SUPER ADMIN ATTENDANCE ERROR:", err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
