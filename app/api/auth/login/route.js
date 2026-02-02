import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import { comparePassword } from "@/utils/hash";
import { signToken } from "@/utils/jwt";

// 🔥 ROLE NORMALIZER (YAHI USE HOGA)
function normalizeRole(role) {
  return role
    .toLowerCase()
    .replace(/[_\s-]/g, "");
}

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Email or password missing",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "USER_NOT_FOUND",
          message: "User not found",
        },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(
      password,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          error: "PASSWORD_MISMATCH",
          message: "Password incorrect",
        },
        { status: 401 }
      );
    }

    // ✅ YAHAN ROLE NORMALIZE HOTA HAI
    const role = normalizeRole(user.role);

    const allowedRoles = [
      "superadmin",
      "principal",
      "teacher",
    ];

    // ❌ INVALID ROLE
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          error: "INVALID_ROLE",
          message: `Role '${user.role}' not allowed`,
        },
        { status: 403 }
      );
    }

    // 🔐 TOKEN HAMESHA NORMALIZED ROLE SE BANEGA
    const token = signToken({
      id: user._id,
      role,
    });

    const res = NextResponse.json({
      success: true,
      role,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
