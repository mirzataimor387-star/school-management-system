import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
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

    const { principalId, name, phone, address } =
      await req.json();

    const principal = await User.findById(principalId);

    if (!principal || principal.role !== "principal") {
      return NextResponse.json(
        { message: "Invalid principal" },
        { status: 400 }
      );
    }

    principal.name = name;
    principal.phone = phone;
    principal.address = address;

    await principal.save();

    return NextResponse.json({
      success: true,
      message: "Principal bio updated",
    });
  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
