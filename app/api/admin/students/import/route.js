import { NextResponse } from "next/server";
import dbConnect from "@/utils/connectdb";
import Student from "@/models/Student";
import XLSX from "xlsx";

export async function POST(req) {
    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file");
    const classId = formData.get("classId");

    if (!file || !classId) {
        return NextResponse.json(
            { message: "Missing data" },
            { status: 400 }
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let inserted = 0;
    let skipped = 0;

    for (let row of rows) {
        if (!row.Name || !row.Roll) continue;

        const exists = await Student.findOne({
            classId,
            rollNumber: row.Roll,
        });

        if (exists) {
            skipped++;
            continue;
        }

        await Student.create({
            name: row.Name,
            rollNumber: row.Roll,
            classId,
        });

        inserted++;
    }

    return NextResponse.json({
        inserted,
        skipped,
    });
}
