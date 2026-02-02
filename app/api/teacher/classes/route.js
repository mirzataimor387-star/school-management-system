import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import Class from "@/models/Class";

export async function GET() {
  try {
    await dbConnect();

    export async function GET(req) {
  const authUser = await getAuthUser(req);
}

    if (!authUser || authUser.role !== "teacher") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const classes = await Class.find({
      classTeacher: authUser.id, // ✅ REAL ObjectId
    });

    return NextResponse.json(classes);

  } catch (err) {
    console.log("CLASSES ERROR:", err);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
