import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import dbConnect from "@/utils/connectdb";
import User from "@/models/User";
import Campus from "@/models/Campus";

/* =========================================
   ROLE NORMALIZER (OPTIONAL BUT CLEAN)
========================================= */
export function normalizeRole(role) {
  return role?.toLowerCase().replace(/[_\s-]/g, "");
}

/* =========================================
   FUTURE-PROOF AUTH USER
========================================= */
export async function getAuthUser() {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔒 Always fetch fresh user from DB
    const user = await User.findById(decoded.id)
      .populate({
        path: "campusId",
        model: Campus,
        options: { lean: true },
      })
      .lean();

    if (!user) return null;

    return {
      // 🔑 identity
      id: user._id.toString(),
      role: normalizeRole(user.role),

      // 👤 base user
      user,

      // 🏫 optional context (null for superadmin etc.)
      campus: user.campusId || null,

      // 🧠 helpers
      isSuperAdmin: normalizeRole(user.role) === "superadmin",
      isPrincipal: normalizeRole(user.role) === "principal",
      isTeacher: normalizeRole(user.role) === "teacher",

      // raw token data (if ever needed)
      tokenPayload: decoded,
    };

  } catch (error) {
    console.error("getAuthUser error:", error);
    return null;
  }
}
