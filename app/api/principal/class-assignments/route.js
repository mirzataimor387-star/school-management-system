import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Class from "@/models/Class";
import User from "@/models/User";
import { getAuthUser } from "@/utils/getAuthUser";

/* =====================================================
   GET → list classes with assigned class teacher
===================================================== */
export async function GET() {
    try {
        await dbConnect();

        const authUser = await getAuthUser();

        if (!authUser || authUser.role !== "principal") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const classes = await Class.find({
            campusId: authUser.campusId,
        })
            .populate("classTeacher", "name email phone")
            .sort({ className: 1, section: 1 });

        return NextResponse.json({
            success: true,
            classes,
        });

    } catch (err) {
        console.log("CLASS ASSIGNMENTS GET ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

/* =====================================================
   POST → assign OR change class teacher
===================================================== */
export async function POST(req) {
    try {
        await dbConnect();

        const authUser = await getAuthUser();

        if (!authUser || authUser.role !== "principal") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { classId, teacherId } = await req.json();

        if (!classId || !teacherId) {
            return NextResponse.json(
                { message: "Class and teacher required" },
                { status: 400 }
            );
        }

        const teacher = await User.findOne({
            _id: teacherId,
            role: "teacher",
            campusId: authUser.campusId,
        });

        if (!teacher) {
            return NextResponse.json(
                { message: "Invalid teacher" },
                { status: 400 }
            );
        }

        await Class.findOneAndUpdate(
            {
                _id: classId,
                campusId: authUser.campusId,
            },
            {
                classTeacher: teacherId,
            }
        );

        return NextResponse.json({
            success: true,
            message: "Class teacher assigned successfully",
        });

    } catch (err) {
        console.log("CLASS ASSIGN POST ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

/* =====================================================
   DELETE → remove class teacher
===================================================== */
export async function DELETE(req) {
    try {
        await dbConnect();

        const authUser = await getAuthUser();

        if (!authUser || authUser.role !== "principal") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { classId } = await req.json();

        if (!classId) {
            return NextResponse.json(
                { message: "Class ID required" },
                { status: 400 }
            );
        }

        await Class.findOneAndUpdate(
            {
                _id: classId,
                campusId: authUser.campusId,
            },
            {
                classTeacher: null,
            }
        );

        return NextResponse.json({
            success: true,
            message: "Class teacher removed successfully",
        });

    } catch (err) {
        console.log("CLASS ASSIGN DELETE ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
