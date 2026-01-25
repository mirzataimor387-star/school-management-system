import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Class from "@/models/Class";
import { getAuthUser } from "@/utils/getAuthUser";

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
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
