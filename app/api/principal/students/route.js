import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import { getAuthUser } from "@/utils/getAuthUser";

/* ============================
   GET → principal view students
============================ */
export async function GET() {
    try {
        await dbConnect();

        const authUser = await getAuthUser();

        // 🔐 only principal
        if (!authUser || authUser.role !== "principal") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const students = await Student.find({
            campusId: authUser.campusId,
        })
            .populate("classId", "className section")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            students,
        });

    } catch (err) {
        console.log("PRINCIPAL STUDENTS ERROR:", err.message);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
