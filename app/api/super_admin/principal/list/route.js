import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET() {
    try {
        await dbConnect();

        const user = await getAuthUser();

        if (!user || user.role !== "super_admin") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const principals = await User.find({
            role: "principal",
        }).select("_id name email campusId");

        return NextResponse.json({
            success: true,
            principals,
        });

    } catch (err) {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
