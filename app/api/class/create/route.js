import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import { Class } from "@/models/Class";

export async function POST(request) {
    try {
        await dbConnect();

        const authUser = await getAuthUser(request);

        if (!authUser || authUser.role !== "principal") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const newClass = await Class.create({
            className: body.className,
            section: body.section,
            campusId: authUser.campusId,
        });

        return NextResponse.json(newClass);

    } catch (error) {
        console.error("CLASS CREATE ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
