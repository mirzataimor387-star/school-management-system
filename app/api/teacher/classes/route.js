import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import Class from "@/models/Class";

export async function GET(request) {
  try {
    await dbConnect();

    const authUser = await getAuthUser(request);

    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const classes = await Class.find({
      classTeacher: authUser.id,
    });

    return NextResponse.json(classes);

  } catch (err) {
    console.error("CLASSES ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
