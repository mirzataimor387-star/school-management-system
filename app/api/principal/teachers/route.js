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

    const auth = await getAuthUser();

    if (!auth || !auth.isPrincipal) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const teachers = await User.find({
      role: "teacher",
      campusId: auth.campus._id,
    }).select("-password");

    return NextResponse.json({
      success: true,
      teachers,
    });

  } catch (error) {
    console.error("GET TEACHERS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
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

    const auth = await getAuthUser();

    if (!auth || !auth.isPrincipal) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, email, password, phone, address } = await req.json();

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Teacher already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      campusId: auth.campus._id,
      phone,
      address,
    });

    return NextResponse.json({
      success: true,
      teacher,
    });

  } catch (error) {
    console.error("ADD TEACHER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
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

    const auth = await getAuthUser();

    if (!auth || !auth.isPrincipal) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
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
      campusId: auth.campus._id,
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
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

  } catch (error) {
    console.error("UPDATE TEACHER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* ============================
   DELETE → hard delete
============================ */
export async function DELETE(req) {
  try {
    await dbConnect();

    const auth = await getAuthUser();

    if (!auth || !auth.isPrincipal) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { teacherId } = await req.json();

    const teacher = await User.findOneAndDelete({
      _id: teacherId,
      role: "teacher",
      campusId: auth.campus._id,
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teacher permanently deleted",
    });

  } catch (error) {
    console.error("DELETE TEACHER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
