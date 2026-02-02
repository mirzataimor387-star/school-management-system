import dbConnect from "@/utils/connectdb";
import Campus from "@/models/Campus";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils/getAuthUser";

/* ======================
   CREATE + LIST CAMPUS
====================== */

export async function POST(req) {
  try {
    const user = await getAuthUser();

    if (!user || user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { schoolName, name, code, currentSession } =
      await req.json();

    if (!schoolName || !name || !code || !currentSession) {
      return NextResponse.json(
        {
          success: false,
          message: "School name, campus name, code and session required",
        },
        { status: 400 }
      );
    }

    const exists = await Campus.findOne({
      code: code.toUpperCase(),
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Campus code already exists" },
        { status: 409 }
      );
    }

    const campus = await Campus.create({
      schoolName,
      name,
      code: code.toUpperCase(),
      currentSession,
    });

    return NextResponse.json(
      { success: true, campus },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE CAMPUS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user || user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    const campuses = await Campus.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(
      { success: true, campuses },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET CAMPUSES ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
