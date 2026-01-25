import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Campus from "@/models/Campus";
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

        const campuses = await Campus.find()
            .lean()
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            campuses,
        });

    } catch (err) {
        console.log("CAMPUS LIST ERROR 👉", err);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
