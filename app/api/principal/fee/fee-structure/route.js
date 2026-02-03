import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import FeeStructure from "@/models/FeeStructure";
import { getAuthUser } from "@/utils/getAuthUser";

/* ======================================================
   GET → FEE STRUCTURE BY CLASS ID
====================================================== */
export async function GET(req) {
  try {
    await dbConnect();

    const user = await getAuthUser(req);

    if (!user || !user.isPrincipal) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing classId" },
        { status: 400 }
      );
    }

    const structure = await FeeStructure.findOne({
      campusId: user.campusId,
      classId,
    });

    if (!structure) {
      return NextResponse.json(
        { success: false, message: "Fee structure not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, structure },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET FEE STRUCTURE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST → CREATE OR UPDATE (UPSERT)
====================================================== */
export async function POST(req) {
  try {
    await dbConnect();

    const user = await getAuthUser(req);

    if (!user || !user.isPrincipal) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      classId,
      monthlyFee,
      paperFee = 0,
      lateFee = 100,
    } = body;

    // ===============================
    // VALIDATION
    // ===============================
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing classId" },
        { status: 400 }
      );
    }

    if (monthlyFee === undefined || Number(monthlyFee) < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid monthly fee" },
        { status: 400 }
      );
    }

    if (paperFee < 0 || lateFee < 0) {
      return NextResponse.json(
        { success: false, message: "Fee values cannot be negative" },
        { status: 400 }
      );
    }

    // ===============================
    // 🔁 CREATE OR UPDATE (UPSERT)
    // ===============================
    const structure = await FeeStructure.findOneAndUpdate(
      {
        campusId: user.campusId,
        classId,
      },
      {
        $set: {
          monthlyFee: Number(monthlyFee),
          paperFee: Number(paperFee),
          lateFee: Number(lateFee),
          updatedBy: user.id,
        },
        $setOnInsert: {
          campusId: user.campusId,
          classId,
          createdBy: user.id,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Fee structure saved successfully",
        structure,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("FEE STRUCTURE API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
