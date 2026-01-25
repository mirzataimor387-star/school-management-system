import { withRBAC } from "@/utils/withRBAC";
import Class from "@/models/Class";
import dbConnect from "@/utils/connectdb";
import { NextResponse } from "next/server";

export const POST = withRBAC(
    ["principal"],
    { campusKey: "campusId" }
)(
    async (req, user) => {
        await dbConnect();

        const body = await req.json();

        const newClass = await Class.create({
            className: body.className,
            section: body.section,
            campusId: user.campusId,
        });

        return NextResponse.json(newClass);
    }
);
