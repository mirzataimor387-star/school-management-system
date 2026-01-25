import dbConnect from "@/utils/connectdb";
import Campus from "@/models/Campus";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils/getAuthUser";

/* ======================
   CREATE CAMPUS
====================== */
export async function POST(req) {
    try {
        const user = await getAuthUser();

        // 🔒 SUPER ADMIN ONLY
        if (!user || user.role !== "super_admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        await dbConnect();

        const { name, code } = await req.json();

        if (!name || !code) {
            return NextResponse.json(
                { success: false, message: "All fields required" },
                { status: 400 }
            );
        }

        const exists = await Campus.findOne({ code });

        if (exists) {
            return NextResponse.json(
                { success: false, message: "Campus code already exists" },
                { status: 409 }
            );
        }

        const campus = await Campus.create({
            name,
            code: code.toUpperCase(),
        });

        return NextResponse.json(
            { success: true, campus },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

/* ======================
   GET CAMPUSES
====================== */
export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== "super_admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        await dbConnect();

        const campuses = await Campus.find().sort({ createdAt: -1 });

        return NextResponse.json(
            { success: true, campuses },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
