import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";
import User from "@/models/User";

export async function GET(request) {
  try {
    await dbConnect();

    const authUser = await getAuthUser(request);

    // 🔐 only superadmin
    if (!authUser || authUser.role !== "superadmin") {
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

    // ✅ teachers = users with role "teacher" of this campus
    const teachers = await User.find({
      role: "teacher",
      campusId: campusId,
    })
      .select("name email phone avatar")
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      teachers,
    });

  } catch (err) {
    console.error("TEACHERS API ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
