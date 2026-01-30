import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();

        const principals = await User.find({
            role: "principal",
        })
            .select("name email phone campusId createdAt")
            .lean();

        return NextResponse.json({
            success: true,
            principals,
        });

    } catch (err) {
        console.error("PRINCIPAL LIST ERROR:", err);
        return NextResponse.json(
            { success: false, message: "Failed to load principals" },
            { status: 500 }
        );
    }
}
