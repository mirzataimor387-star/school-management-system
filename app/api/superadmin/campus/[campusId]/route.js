import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Campus from "@/models/Campus";
import User from "@/models/User";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET(request, { params }) {
    try {
        await dbConnect();

        // ✅ FIX #1 — pass request
        const user = await getAuthUser(request);

        // ✅ FIX #2 — proper auth check
        if (!user || user.role !== "superadmin") {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        const campus = await Campus.findById(params.campusId);

        if (!campus) {
            return NextResponse.json(
                { success: false, message: "Campus not found" },
                { status: 404 }
            );
        }

        let principal = null;

        if (campus.principal) {
            principal = await User.findById(
                campus.principal
            ).select("name email phone address avatar");
        }

        return NextResponse.json({
            success: true,
            campus,
            principal,
        });

    } catch (err) {
        console.log("CAMPUS FETCH ERROR:", err.message);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
