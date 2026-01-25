import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Campus from "@/models/Campus";
import User from "@/models/User";
import { getAuthUser } from "@/utils/getAuthUser";

export async function POST(req) {
  try {
    await dbConnect();

    const admin = await getAuthUser();

    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { campusId } = await req.json();

    const campus = await Campus.findById(campusId);

    if (!campus || !campus.principal) {
      return NextResponse.json(
        { message: "No principal assigned" },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(
      campus.principal,
      { campusId: null }
    );

    campus.principal = null;
    await campus.save();

    return NextResponse.json({
      success: true,
      message: "Principal removed successfully",
    });

  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
