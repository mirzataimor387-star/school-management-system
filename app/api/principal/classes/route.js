import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Class from "@/models/Class";
import { getAuthUser } from "@/utils/getAuthUser";

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

    const classes = await Class.find({
      campusId: authUser.campusId,
    })
      .populate({
        path: "classTeacher",
        model: "User",
        select: "name email",
      })
      // ✅ ASCENDING ORDER
      .sort({ className: 1, section: 1 });

    return NextResponse.json({
      success: true,
      classes,
    });

  } catch (err) {
    console.log("CLASSES ERROR:", err.message);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE CLASS
========================= */

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

    const { className, section, session } = await req.json();

    const exists = await Class.findOne({
      className,
      section,
      session,
      campusId: authUser.campusId,
    });

    if (exists) {
      return NextResponse.json(
        { message: "Class already exists" },
        { status: 400 }
      );
    }

    const newClass = await Class.create({
      className,
      section,
      session,
      campusId: authUser.campusId,
    });

    return NextResponse.json({
      success: true,
      class: newClass,
    });

  } catch (err) {
    console.log("CREATE CLASS ERROR:", err.message);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
