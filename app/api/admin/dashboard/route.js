import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import User from "@/models/User";
import Student from "@/models/Student";
import Class from "@/models/Class";

export async function GET() {
    try {
        await dbConnect();

        const totalTeachers = await User.countDocuments({
            role: "teacher",
        });

        const totalStudents = await Student.countDocuments({
            status: "active",
        });

        const totalClasses = await Class.countDocuments();

        return NextResponse.json({
            totalTeachers,
            totalStudents,
            totalClasses,
        });
    } catch (error) {
        return NextResponse.json(
            {
                totalTeachers: 0,
                totalStudents: 0,
                totalClasses: 0,
            },
            { status: 200 }
        );
    }
}
