import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import ClassFeeSummary from "@/models/ClassFeeSummary";

/*
=====================================================
ONE-TIME FIX (MONGOOSE SAFE)
month: "1" (string) → 1 (number)

✔ No aggregation pipeline
✔ No Compass
✔ Works everywhere
=====================================================
*/

export async function GET() {
  try {
    await dbConnect();

    // 🔹 find all wrong records
    const docs = await ClassFeeSummary.find({
      month: { $type: "string" },
    });

    let fixed = 0;

    for (const doc of docs) {
      const newMonth = Number(doc.month);

      if (!Number.isNaN(newMonth)) {
        doc.month = newMonth;
        await doc.save();
        fixed++;
      }
    }

    return NextResponse.json({
      success: true,
      fixed,
      totalFound: docs.length,
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
