import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/utils/connectdb";
import FeeStructure from "@/models/FeeStructure";
import { getAuthUser } from "@/utils/getAuthUser";

/* ======================================================
   ✅ GET FEE STRUCTURE BY CLASS ID
   👉 ADDED HERE (used in preview before generation)
====================================================== */
export async function GET(req) {
  try {
    await dbConnect();

    const user = await getAuthUser();

    if (!user || user.role !== "principal") {
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
        {
          success: false,
          message: "Fee structure not found for this class",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        structure,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET FEE STRUCTURE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST → CREATE FEE STRUCTURE
====================================================== */
export async function POST(req) {
  try {
    // ===============================
    // DB CONNECT
    // ===============================
    await dbConnect();

    // ===============================
    // AUTH
    // ===============================
    const user = await getAuthUser();

    if (!user || user.role !== "principal") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // ===============================
    // BODY
    // ===============================
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
        {
          success: false,
          message: "Invalid or missing classId",
        },
        { status: 400 }
      );
    }

    if (monthlyFee === undefined || isNaN(monthlyFee) || Number(monthlyFee) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid monthlyFee",
        },
        { status: 400 }
      );
    }

    if (paperFee < 0 || lateFee < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Fee values cannot be negative",
        },
        { status: 400 }
      );
    }

    // ===============================
    // DUPLICATE PROTECTION
    // ===============================
    const exists = await FeeStructure.findOne({
      campusId: user.campusId,
      classId,
    });

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Fee structure already exists for this class",
        },
        { status: 409 }
      );
    }

    // ===============================
    // CREATE
    // ===============================
    const structure = await FeeStructure.create({
      campusId: user.campusId,
      classId,
      monthlyFee: Number(monthlyFee),
      paperFee: Number(paperFee),
      lateFee: Number(lateFee),
      createdBy: user._id,
    });

    // ===============================
    // RESPONSE
    // ===============================
    return NextResponse.json(
      {
        success: true,
        message: "Fee structure created successfully",
        structure,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("FEE STRUCTURE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
