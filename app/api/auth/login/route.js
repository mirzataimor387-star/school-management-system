import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import { comparePassword } from "@/utils/hash";
import { signToken } from "@/utils/jwt";

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    const cleanEmail = email.trim().toLowerCase();

    console.log("📩 EMAIL FROM UI:", cleanEmail);
    console.log("🔑 PASSWORD FROM UI:", password);

    const user = await User.findOne({ email: cleanEmail });

    console.log("👤 USER FROM DB:", user);

    if (!user) {
      console.log("❌ USER NOT FOUND IN DB");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("🔐 HASH IN DB:", user.password);

    const isMatch = await comparePassword(password, user.password);

    console.log("✅ PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      role: user.role,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;

  } catch (err) {
    console.log("🔥 LOGIN ERROR:", err);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
