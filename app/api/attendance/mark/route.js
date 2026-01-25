import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import Student from "@/models/Student";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(req) {
    try {
        await dbConnect();

        // 🔐 get logged-in user
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (user.role !== "teacher") {
            return NextResponse.json(
                { message: "Only teachers can mark attendance" },
                { status: 403 }
            );
        }

        const { date, records } = await req.json();

        if (!date || !records?.length) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1️⃣ find teacher assigned class
        const assignedClass = await Class.findOne({
            inchargeTeacher: user._id,
            campusId: user.campusId,
        });

        if (!assignedClass) {
            return NextResponse.json(
                { message: "You are not class incharge" },
                { status: 403 }
            );
        }

        // 2️⃣ fetch students of this class
        const students = await Student.find({
            classId: assignedClass._id,
            campusId: user.campusId,
            status: "active",
        }).select("_id");

        const validStudentIds = students.map((s) =>
            s._id.toString()
        );

        // 3️⃣ validate student list
        for (const rec of records) {
            if (!validStudentIds.includes(rec.studentId)) {
                return NextResponse.json(
                    { message: "Invalid student detected" },
                    { status: 400 }
                );
            }
        }

        // 4️⃣ bulk upsert attendance
        const attendanceDate = new Date(date);

        const bulkOps = records.map((rec) => ({
            updateOne: {
                filter: {
                    student: rec.studentId,
                    date: attendanceDate,
                },
                update: {
                    $set: {
                        classId: assignedClass._id,
                        campusId: user.campusId,
                        status: rec.status,
                        markedBy: user._id,
                    },
                },
                upsert: true,
            },
        }));

        await Attendance.bulkWrite(bulkOps);

        return NextResponse.json({
            message: "Attendance saved successfully",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: err.message },
            { status: 500 }
        );
    }
}
