import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

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

    return NextResponse.json({
      success: true,

      // 👤 principal user (password already removed in auth)
      principal: auth.user,

      // 🏫 campus already populated
      campus: auth.campus,
    });

  } catch (error) {
    console.error("PRINCIPAL ME API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
