import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import Campus from "@/models/Campus";

export async function POST(req) {
    try {
        await dbConnect();

        const { campusId, principalId } = await req.json();

        if (!campusId || !principalId) {
            return NextResponse.json(
                { message: "CampusId and PrincipalId required" },
                { status: 400 }
            );
        }

        const campus = await Campus.findById(campusId);
        if (!campus) {
            return NextResponse.json(
                { message: "Campus not found" },
                { status: 404 }
            );
        }

        // one campus = one principal
        if (campus.principalId) {
            return NextResponse.json(
                { message: "Campus already has a principal" },
                { status: 409 }
            );
        }

        const principal = await User.findOne({
            _id: principalId,
            role: "principal",
        });

        if (!principal) {
            return NextResponse.json(
                { message: "Invalid principal" },
                { status: 404 }
            );
        }

        // one principal = one campus
        if (principal.campusId) {
            return NextResponse.json(
                { message: "Principal already assigned to a campus" },
                { status: 409 }
            );
        }

        // 🔥 VERY IMPORTANT — update BOTH
        await Campus.findByIdAndUpdate(campusId, {
            principalId: principalId,
        });

        await User.findByIdAndUpdate(principalId, {
            campusId: campusId,
        });

        return NextResponse.json({
            message: "Principal assigned successfully",
        });

    } catch (err) {
        console.error("ASSIGN PRINCIPAL ERROR:", err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
