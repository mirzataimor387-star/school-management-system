import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/utils/getAuthUser";

/* ============================
   GET → list teachers
============================ */
export async function GET() {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

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

/* ============================
   POST → add teacher
============================ */
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

    const { name, email, password, phone, address } = await req.json();

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
      campusId: authUser.campusId,
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

/* ============================
   PUT → update teacher
============================ */
export async function PUT(req) {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      teacherId,
      name,
      email,
      password,
      phone,
      address,
    } = await req.json();

    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
      campusId: authUser.campusId,
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    teacher.name = name;
    teacher.email = email;
    teacher.phone = phone;
    teacher.address = address;

    if (password) {
      teacher.password = await bcrypt.hash(password, 10);
    }

    await teacher.save();

    return NextResponse.json({
      success: true,
      message: "Teacher updated successfully",
    });

  } catch (err) {
    console.log("UPDATE TEACHER ERROR:", err.message);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* ============================
   DELETE → HARD DELETE
============================ */
export async function DELETE(req) {
  try {
    await dbConnect();

    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== "principal") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { teacherId } = await req.json();

    const teacher = await User.findOneAndDelete({
      _id: teacherId,
      role: "teacher",
      campusId: authUser.campusId,
    });

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teacher permanently deleted",
    });

  } catch (err) {
    console.log("DELETE TEACHER ERROR:", err.message);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
