import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Class from "@/models/Class";
import User from "@/models/User";
import { getAuthUser } from "@/utils/getAuthUser";

/* ============================
   GET → list classes + teacher
============================ */
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
        }).populate("classTeacher", "name email");

        return NextResponse.json({
            success: true,
            classes,
        });

    } catch (err) {
        console.log("GET CLASS ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

/* ============================
   POST → assign / change teacher
============================ */
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

        const classData = await Class.findOne({
            _id: classId,
            campusId: authUser.campusId,
        });

        if (!classData) {
            return NextResponse.json(
                { message: "Invalid class" },
                { status: 400 }
            );
        }

        // ✅ assign OR change
        classData.classTeacher = teacherId;
        await classData.save();

        return NextResponse.json({
            success: true,
            message: "Class teacher assigned / updated",
        });

    } catch (err) {
        console.log("ASSIGN CLASS ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

/* ============================
   DELETE → remove teacher only
============================ */
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

        const classData = await Class.findOne({
            _id: classId,
            campusId: authUser.campusId,
        });

        if (!classData) {
            return NextResponse.json(
                { message: "Invalid class" },
                { status: 400 }
            );
        }

        // 🔥 ONLY remove teacher
        classData.classTeacher = null;
        await classData.save();

        return NextResponse.json({
            success: true,
            message: "Class teacher removed successfully",
        });

    } catch (err) {
        console.log("REMOVE CLASS TEACHER ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
