import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/utils/getAuthUser";

export async function GET() {
  try {
    await dbConnect();

    const authUser = await getAuthUser();
    console.log("AUTH USER FROM COOKIE:", authUser);


    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const teachers = await User.find({
      role: "teacher",
      campusId: authUser.campusId,
    }).select("-password");

    return NextResponse.json({
      success: true,
      teachers,
    });

  } catch (err) {
    console.log("GET TEACHERS ERROR:", err.message);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, email, password, phone, address } =
      await req.json();

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { message: "Teacher already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      campusId: authUser.campusId, // 🔥 VERY IMPORTANT
      phone,
      address,
    });

    return NextResponse.json({
      success: true,
      teacher,
    });

  } catch (err) {
    console.log("ADD TEACHER ERROR:", err.message);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
