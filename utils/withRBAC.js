import { NextResponse } from "next/server";
import { getAuthUser } from "./getAuthUser";

/**
 * roles: ["superadmin", "principal", "teacher"]
 * options: { campus: true }
 */
export async function withRBAC(roles = [], options = {}) {
  const user = await getAuthUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (!roles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  // superadmin bypass
  if (user.role === "superadmin") {
    return { user };
  }

  if (options.campus && !user.campusId) {
    return {
      error: NextResponse.json(
        { success: false, message: "Campus missing" },
        { status: 403 }
      ),
    };
  }

  return { user };
}
