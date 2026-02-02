import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import { Class } from "@/models/Class";
import { getAuthUser } from "@/utils/getAuthUser";

/* =====================================================
   GET ALL CLASSES (PRINCIPAL)
===================================================== */
export async function GET() {
  try {
    await dbConnect();

    const auth = await getAuthUser();

    if (!auth || !auth.isPrincipal || !auth.campus) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          classes: [],
        },
        { status: 401 }
      );
    }

    // 🔎 DEBUG (temporary — remove later)
    console.log("AUTH CAMPUS ID:", auth.campus._id.toString());

    const campusId = new mongoose.Types.ObjectId(auth.campus._id);

    const classes = await Class.find({ campusId })
      .sort({ className: 1, section: 1 })
      .lean();

    // 🔎 DEBUG
    console.log(
      "CLASSES FOUND:",
      classes.map(c => ({
        id: c._id.toString(),
        campusId: c.campusId.toString(),
        className: c.className,
      }))
    );

    return NextResponse.json({
      success: true,
      campusId: campusId.toString(), // 👈 frontend ko bhi dikhe
      total: classes.length,
      classes,
    });

  } catch (error) {
    console.error("CLASSES GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        classes: [],
      },
      { status: 500 }
    );
  }
}

/* =====================================================
   CREATE CLASS (PRINCIPAL)
===================================================== */
export async function POST(req) {
  try {
    await dbConnect();

    const auth = await getAuthUser();

    if (!auth || !auth.isPrincipal || !auth.campus) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { className, section, session } = await req.json();

    if (!className || !section || !session) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const campusId = new mongoose.Types.ObjectId(auth.campus._id);

    // 🔎 DEBUG
    console.log("CREATING CLASS FOR CAMPUS:", campusId.toString());

    const exists = await Class.findOne({
      className,
      section,
      session,
      campusId,
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Class already exists" },
        { status: 400 }
      );
    }

    const newClass = await Class.create({
      className,
      section,
      session,
      campusId,
    });

    return NextResponse.json({
      success: true,
      message: "Class created successfully",
      class: newClass,
    });

  } catch (error) {
    console.error("CREATE CLASS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
