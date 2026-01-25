import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";

export async function GET() {
    await dbConnect();

    const teachers = await User.find({ role: "teacher" }).select(
        "_id name email"
    );

    return NextResponse.json({ teachers });
}
