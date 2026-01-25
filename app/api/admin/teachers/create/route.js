import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";

import User from "@/models/User";
import { hashPassword } from "@/utils/hash";

export async function POST(req) {
    await dbConnect();

    const { name, email, password } = await req.json();

    const exists = await User.findOne({ email });

    if (exists) {
        return NextResponse.json(
            { message: "Teacher already exists" },
            { status: 409 }
        );
    }

    const hashed = await hashPassword(password);

    await User.create({
        name,
        email,
        password: hashed,
        role: "teacher",
    });

    return NextResponse.json({
        message: "Teacher added successfully",
    });
}
