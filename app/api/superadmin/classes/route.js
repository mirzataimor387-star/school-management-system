import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import Class from "@/models/Class";

export async function GET(request) {
  try {
    await dbConnect();

    const user = await getAuthUser(request);

    // 🔐 only superadmin
    if (!user || user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");

    if (!campusId) {
      return NextResponse.json(
        { success: false, message: "CampusId required" },
        { status: 400 }
      );
    }

    // ✅ ONLY selected campus classes
    const classes = await Class.find({
      campusId: campusId,
    }).sort({ className: 1, section: 1 });

    return NextResponse.json({
      success: true,
      classes,
    });

  } catch (err) {
    console.error("SUPERADMIN CLASSES ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
