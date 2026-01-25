import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Class from "@/models/Class";

export async function GET() {
    try {
        await dbConnect();

        const classes = await Class.find().populate(
            "inchargeTeacher",
            "name email"
        );

        return NextResponse.json({ success: true, classes });

    } catch (err) {
        console.log("CLASS LIST ERROR:", err.message);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
