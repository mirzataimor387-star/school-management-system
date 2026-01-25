import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import Student from "@/models/Student";
import User from "@/models/User";

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);

        const teacherId = searchParams.get("teacherId");
        const date = searchParams.get("date");

        if (!teacherId || !date) {
            return NextResponse.json(
                { message: "teacherId and date required" },
                { status: 400 }
            );
        }

        // 1️⃣ verify teacher
        const teacher = await User.findById(teacherId);

        if (!teacher || teacher.role !== "teacher") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2️⃣ find assigned class
        const assignedClass = await Class.findOne({
            inchargeTeacher: teacherId,
        });

        if (!assignedClass) {
            return NextResponse.json(
                { message: "No class assigned" },
                { status: 403 }
            );
        }

        // 3️⃣ get class students
        const students = await Student.find({
            classId: assignedClass._id,
            status: "active",
        }).select("_id name rollNo");

        // 4️⃣ get attendance for date
        const attendanceDate = new Date(date);

        const attendanceRecords = await Attendance.find({
            classId: assignedClass._id,
            date: attendanceDate,
        });

        // 5️⃣ map attendance
        const attendanceMap = {};

        attendanceRecords.forEach((rec) => {
            attendanceMap[rec.student.toString()] = rec.status;
        });

        // 6️⃣ merge students + attendance
        const result = students.map((student) => ({
            studentId: student._id,
            name: student.name,
            rollNo: student.rollNo,
            status: attendanceMap[student._id.toString()] || "present",
        }));

        return NextResponse.json({
            classId: assignedClass._id,
            date,
            students: result,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: err.message },
            { status: 500 }
        );
    }
}
