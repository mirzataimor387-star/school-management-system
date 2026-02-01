import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import Campus from "@/models/Campus";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET() {
    try {
        await dbConnect();

        const authUser = await getAuthUser();

        if (!authUser || authUser.role !== "principal") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // user already authenticated — no need to re-check existence
        const principal = await User.findById(authUser.id)
            .select("-password")
            .lean();

        const campus = authUser.campusId
            ? await Campus.findById(authUser.campusId).lean()
            : null;

        return NextResponse.json({
            success: true,
            principal,
            campus,
        });

    } catch (error) {
        console.error("PRINCIPAL ME API ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
