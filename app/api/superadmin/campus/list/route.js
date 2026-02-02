import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Campus from "@/models/Campus";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();

        const campuses = await Campus.find().lean();

        const result = [];

        for (const campus of campuses) {
            let principal = null;

            if (campus.principalId) {
                principal = await User.findById(campus.principalId)
                    .select("name email")
                    .lean();
            }

            result.push({
                ...campus,
                principal, // 🔥 THIS FIELD IS REQUIRED
            });
        }

        return NextResponse.json({
            success: true,
            campuses: result,
        });

    } catch (err) {
        console.error("CAMPUS LIST ERROR:", err);
        return NextResponse.json(
            { success: false, message: "Failed to load campuses" },
            { status: 500 }
        );
    }
}
