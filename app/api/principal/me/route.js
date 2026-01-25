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
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const principal = await User.findById(authUser.id)
            .select("name email phone address avatar campusId");

        const campus = await Campus.findById(principal.campusId)
            .select("name code location");

        return NextResponse.json({
            success: true,
            principal,
            campus,
        });

    } catch (err) {
        console.log("PRINCIPAL ME ERROR:", err.message);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
