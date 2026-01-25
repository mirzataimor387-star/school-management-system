import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import Class from "@/models/Class";
import Student from "@/models/Student";

export async function POST(req) {
    await dbConnect();

    const { teacherId } = await req.json();

    const assignedClass = await Class.findOne({
        inchargeTeacher: teacherId,
    });

    if (!assignedClass) {
        return NextResponse.json({ class: null });
    }

    const students = await Student.find({
        classId: assignedClass._id,
        status: "active",
    }).sort({ rollNumber: 1 });

    return NextResponse.json({
        class: assignedClass,
        students,
    });
}
