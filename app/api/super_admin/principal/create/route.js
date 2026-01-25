import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import Campus from "@/models/Campus";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(req) {
    try {
        await dbConnect();

        const admin = await getAuthUser();

        if (!admin || admin.role !== "super_admin") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const {
            campusId,
            name,
            email,
            password,
            phone,
            address,
        } = await req.json();

        if (!campusId || !name || !email || !password) {
            return NextResponse.json(
                { message: "Required fields missing" },
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

        if (campus.principal) {
            return NextResponse.json(
                { message: "Principal already exists for this campus" },
                { status: 409 }
            );
        }

        const existing = await User.findOne({ email });

        if (existing) {
            return NextResponse.json(
                { message: "Email already in use" },
                { status: 409 }
            );
        }

        const hashed = await bcrypt.hash(password, 10);

        const principal = await User.create({
            name,
            email,
            password: hashed,
            role: "principal",
            campusId,
            phone,
            address,
        });

        campus.principal = principal._id;
        await campus.save();

        return NextResponse.json({
            success: true,
            message: "Principal added successfully",
            principal,
        });

    } catch (err) {
        return NextResponse.json(
            { message: err.message },
            { status: 500 }
        );
    }
}
