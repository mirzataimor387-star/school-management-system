export const runtime = "nodejs";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import FeeVoucher from "@/models/FeeVoucher";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Campus from "@/models/Campus";


/* =====================================
   CONSTANTS
===================================== */
const BORDER_COLOR = rgb(0.6, 0.6, 0.6); // soft grey
const WHITE = rgb(1, 1, 1);

/* =====================================
   SAFE LOGO LOADER (WITH FILE NAME)
===================================== */
async function loadLogo(pdfDoc, fileName) {
    try {
        const logoPath = path.join(process.cwd(), "public", fileName);
        if (!fs.existsSync(logoPath)) return null;
        const bytes = fs.readFileSync(logoPath);
        return await pdfDoc.embedPng(bytes);
    } catch {
        return null;
    }
}

/* =====================================
   DRAW SINGLE PAGE (2 COPIES)
===================================== */
async function addVoucherPage(pdfDoc, { campus, student, voucher }) {
    const page = pdfDoc.addPage([595, 842]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const leftLogo = await loadLogo(pdfDoc, "leftschool-logo.png");
    const rightLogo = await loadLogo(pdfDoc, "rightschool-logo.png");

    /* ================= PAGE BORDER ================= */
    page.drawRectangle({
        x: 20,
        y: 20,
        width: 555,
        height: 802,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        color: WHITE, // 🔴 VERY IMPORTANT (NO BLACK)
    });

    const monthLabel = new Date(
        voucher.year,
        voucher.month - 1
    ).toLocaleString("en-US", { month: "long", year: "numeric" });

    const lateAfter = new Date(voucher.year, voucher.month - 1, 10);
    const lateFee = new Date() > lateAfter ? 100 : 0;
    const totalPayable = voucher.monthlyFee + lateFee;

    const drawCopy = (yTop, copyTitle) => {
        /* ================= HEADER ================= */
        if (leftLogo) {
            page.drawImage(leftLogo, {
                x: 50,
                y: yTop - 60,
                width: 70,
                height: 75,
            });
        }

        if (rightLogo) {
            page.drawImage(rightLogo, {
                x: 470,
                y: yTop - 60,
                width: 70,
                height: 75,
            });
        }

        page.drawText(campus.schoolName, {
            x:
                595 / 2 -
                bold.widthOfTextAtSize(campus.schoolName, 15) / 2,
            y: yTop,
            size: 15,
            font: bold,
        });

        page.drawText(`Campus Code: ${campus.code}`, {
            x: 595 / 2 - 60,
            y: yTop - 18,
            size: 9,
            font,
        });

        page.drawText(copyTitle, {
            x: 595 / 2 - 35,
            y: yTop - 32,
            size: 9,
            font,
        });

        /* ================= COPY BORDER ================= */
        // page.drawRectangle({
        //     x: 35,
        //     y: yTop - 275,
        //     width: 525,
        //     height: 245,
        //     borderWidth: 1,
        //     borderColor: BORDER_COLOR,
        //     color: WHITE, // 🔴 FIX
        // });

        let y = yTop - 80;

        const tableRow = (label, value) => {
            page.drawRectangle({
                x: 45,
                y: y - 16,
                width: 180,
                height: 18,
                borderWidth: 0.6,
                borderColor: BORDER_COLOR,
                color: WHITE, // 🔴 FIX
            });

            page.drawRectangle({
                x: 225,
                y: y - 16,
                width: 315,
                height: 18,
                borderWidth: 0.6,
                borderColor: BORDER_COLOR,
                color: WHITE, // 🔴 FIX
            });

            page.drawText(label, {
                x: 50,
                y: y - 13,
                size: 10,
                font: bold,
            });

            page.drawText(String(value ?? "-"), {
                x: 230,
                y: y - 13,
                size: 10,
                font,
            });

            y -= 18;
        };

        /* ================= TABLE DATA ================= */
        tableRow("Student Name", student.name);
        tableRow("Father Name", student.fatherName || "-");
        tableRow("Class", student.className);
        tableRow("Roll No", student.rollNo);
        tableRow("Voucher Month", monthLabel);
        tableRow(
            "Due Date",
            new Date(voucher.dueDate).toLocaleDateString()
        );

        y -= 10;

        tableRow("Monthly Fee", `Rs. ${voucher.monthlyFee}`);
        tableRow("Late Fee", `Rs. ${lateFee}`);
        tableRow("Total Payable", `Rs. ${totalPayable}`);

        y -= 18;

        page.drawText("Authorized Signature:", {
            x: 50,
            y,
            size: 10,
            font,
        });

        page.drawText("Receiving Date:", {
            x: 360,
            y,
            size: 10,
            font,
        });

        page.drawText(
            "Note: Fee must be paid by 10th of each month. After 10th, Rs. 100 late fee will be added.",
            {
                x: 50,
                y: y - 25,
                size: 9,
                font,
                maxWidth: 480,
            }
        );
    };

    /* ================= STUDENT COPY ================= */
    drawCopy(790, "Student Copy");

    /* ================= CUT LINE ================= */
    page.drawLine({
        start: { x: 35, y: 410 },
        end: { x: 560, y: 410 },
        thickness: 0.8,
        color: BORDER_COLOR,
        dashArray: [6, 4],
    });

    /* ================= OFFICE COPY ================= */
    drawCopy(380, "Office Copy");
}

/* =====================================
   GET — CAMPUS WIDE PDF
===================================== */
export async function GET() {
    try {
        await dbConnect();

        const auth = await getAuthUser();
        if (!auth || !auth.isPrincipal) {
            return new Response("Unauthorized", { status: 403 });
        }

        const campusId = auth.campusId;

        const vouchers = await FeeVoucher.find({ campusId })
            .populate("studentId")
            .populate("classId")
            .sort({ classId: 1, year: 1, month: 1 });

        if (!vouchers.length) {
            return new Response("No vouchers found", { status: 404 });
        }

        const pdfDoc = await PDFDocument.create();

        for (const v of vouchers) {
            await addVoucherPage(pdfDoc, {
                campus: auth.campus,
                student: {
                    name: v.studentId.name,
                    fatherName: v.studentId.fatherName,
                    rollNo: v.studentId.rollNumber,
                    className: v.classId.className,
                },
                voucher: {
                    voucherNo: v.voucherNo,
                    month: v.month,
                    year: v.year,
                    dueDate: v.dueDate,
                    monthlyFee: v.fees.monthlyFee,
                },
            });
        }

        const pdfBytes = await pdfDoc.save();

        return new Response(pdfBytes, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    "attachment; filename=campus-fee-vouchers.pdf",
            },
        });
    } catch (err) {
        console.error("CAMPUS PDF ERROR:", err);
        return new Response("PDF generation failed", { status: 500 });
    }
}
