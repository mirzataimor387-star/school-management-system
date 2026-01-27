import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Class from "@/models/Class";
import Student from "@/models/Student";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();

        const authUser = await getAuthUser();

        if (!authUser || authUser.role !== "teacher") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const teacher = await User.findById(authUser.id).select(
            "name avatar"
        );

        const classes = await Class.find({
            classTeacher: authUser.id,
        }).sort({ className: 1, section: 1 });

        if (!classes.length) {
            return NextResponse.json({
                assigned: false,
                teacherName: teacher.name,
                avatar: teacher.avatar,
                classes: [],
            });
        }

        const result = await Promise.all(
            classes.map(async (cls) => {
                const totalStudents = await Student.countDocuments({
                    classId: cls._id,
                });

                return {
                    classId: cls._id,
                    className: cls.className,
                    section: cls.section,
                    session: cls.session,
                    campusId: cls.campusId,
                    totalStudents,
                };
            })
        );

        return NextResponse.json({
            assigned: true,
            teacherName: teacher.name,
            avatar: teacher.avatar,
            classes: result,
        });

    } catch (err) {
        console.log("TEACHER MY CLASS ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
