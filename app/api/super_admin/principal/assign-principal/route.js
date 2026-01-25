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

    const { campusId, principalId } = await req.json();

    const campus = await Campus.findById(campusId);
    const principal = await User.findById(principalId);

    if (!campus || !principal || principal.role !== "principal") {
      return NextResponse.json(
        { message: "Invalid campus or principal" },
        { status: 400 }
      );
    }

    // remove old principal (if exists)
    if (campus.principal) {
      await User.findByIdAndUpdate(
        campus.principal,
        { campusId: null }
      );
    }

    // assign new principal
    campus.principal = principal._id;
    await campus.save();

    principal.campusId = campus._id;
    await principal.save();

    return NextResponse.json({
      success: true,
      message: "Principal assigned successfully",
    });

  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
