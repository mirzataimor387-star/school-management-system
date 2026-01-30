
import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();
        const { name, email, password, phone, address } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Name, email and password are required" },
                { status: 400 }
            );
        }

        // prevent duplicate email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return NextResponse.json(
                { message: "Email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const principal = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "principal",
            phone,
            address,
            campusId: null, // 🔥 important
        });

        return NextResponse.json({
            message: "Principal created successfully",
            principal,
        });

    } catch (err) {
        console.error("CREATE PRINCIPAL ERROR:", err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
