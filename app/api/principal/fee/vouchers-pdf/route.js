export const runtime = "nodejs";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import FeeVoucher from "@/models/FeeVoucher";
import Student from "@/models/Student";
import Class from "@/models/Class";

/* =====================================================
   CONSTANTS
===================================================== */
const BORDER = rgb(0.65, 0.65, 0.65);
const TEXT = rgb(0.15, 0.15, 0.15);
const MUTED = rgb(0.45, 0.45, 0.45);
const WHITE = rgb(1, 1, 1);

/* =====================================================
   NUMBER TO WORDS
===================================================== */
function numberToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num < 20) return a[num];
  if (num < 100)
    return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
  if (num < 1000)
    return (
      a[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " " + numberToWords(num % 100) : "")
    );
  if (num < 100000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 ? " " + numberToWords(num % 1000) : "")
    );

  return String(num);
}

/* =====================================================
   SAFE LOGO LOADER
===================================================== */
async function loadLogo(pdfDoc, fileName) {
  try {
    const p = path.join(process.cwd(), "public", fileName);
    if (!fs.existsSync(p)) return null;
    return await pdfDoc.embedPng(fs.readFileSync(p));
  } catch {
    return null;
  }
}

/* =====================================================
   DRAW SINGLE VOUCHER PAGE
===================================================== */
async function addVoucherPage(pdfDoc, { campus, student, voucher }) {
  const page = pdfDoc.addPage([595, 842]);

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
    borderColor: BORDER,
    color: WHITE,
  });

  const monthLabel = new Date(
    voucher.year,
    voucher.month - 1
  ).toLocaleString("en-US", { month: "long", year: "numeric" });

  const monthlyFee = voucher.monthlyFee;
  const arrears = voucher.arrearsAmount || 0;
  const paperFee = voucher.paperFee || 0;

  const payableWithinDue = monthlyFee + arrears + paperFee;
  const lateFee = 100;
  const payableAfterDue = payableWithinDue + lateFee;

  /* =================================================
     DRAW COPY (Student / Office)
  ================================================= */
  const drawCopy = (yTop, title) => {
    if (leftLogo) page.drawImage(leftLogo, { x: 40, y: yTop - 45, width: 45, height: 45 });
    if (rightLogo) page.drawImage(rightLogo, { x: 510, y: yTop - 45, width: 45, height: 45 });

    page.drawText(campus.schoolName, {
      x: 297.5 - bold.widthOfTextAtSize(campus.schoolName, 15) / 2,
      y: yTop,
      size: 15,
      font: bold,
      color: TEXT,
    });

    page.drawText(title, {
      x: 297.5 - bold.widthOfTextAtSize(title, 9) / 2,
      y: yTop - 18,
      size: 9,
      font: bold,
      color: MUTED,
    });

    let y = yTop - 55;

    /* ================= STUDENT INFO ================= */
    const infoLine = (x, label, value) => {
      page.drawText(`${label}:`, { x, y, size: 9, font: bold, color: TEXT });
      page.drawText(String(value), {
        x: x + bold.widthOfTextAtSize(label + ":", 9) + 4,
        y,
        size: 9,
        font,
        color: TEXT,
      });
    };

    infoLine(45, "Student Name", student.name);
    infoLine(320, "Father Name", student.fatherName || "-");
    y -= 16;

    infoLine(45, "Class", student.className);
    infoLine(320, "Roll No", student.rollNo);
    y -= 16;

    infoLine(45, "Month", monthLabel);
    infoLine(320, "Due Date", new Date(voucher.dueDate).toLocaleDateString());
    y -= 16;

    /* 🔥 ADDED: VOUCHER NUMBER (NO OTHER CHANGE) */
    infoLine(45, "Voucher No", voucher.voucherNo || "-");
    y -= 18;

    page.drawLine({ start: { x: 45, y }, end: { x: 540, y }, thickness: 0.6, color: BORDER });
    y -= 12;

    /* ================= FEE TABLE ================= */
    const rowH = 20;
    const leftX = 45;
    const rightX = 360;
    const tableW = 315;
    const amtW = 180;

    const headerRow = () => {
      page.drawRectangle({
        x: leftX,
        y: y - rowH,
        width: tableW + amtW,
        height: rowH,
        borderWidth: 0.8,
        borderColor: BORDER,
        color: WHITE,
      });
      page.drawText("DETAILS", { x: leftX + 6, y: y - 14, size: 10, font: bold });
      page.drawText("AMOUNT", { x: rightX + 6, y: y - 14, size: 10, font: bold });
      y -= rowH;
    };

    const feeRow = (label, value, boldRow = false) => {
      page.drawRectangle({
        x: leftX,
        y: y - rowH,
        width: tableW,
        height: rowH,
        borderWidth: 0.6,
        borderColor: BORDER,
        color: WHITE,
      });
      page.drawRectangle({
        x: rightX,
        y: y - rowH,
        width: amtW,
        height: rowH,
        borderWidth: 0.6,
        borderColor: BORDER,
        color: WHITE,
      });

      page.drawText(label, {
        x: leftX + 6,
        y: y - 14,
        size: 9,
        font: boldRow ? bold : font,
        color: TEXT,
      });
      page.drawText(String(value), {
        x: rightX + 6,
        y: y - 14,
        size: 9,
        font: boldRow ? bold : font,
        color: TEXT,
      });

      y -= rowH;
    };

    headerRow();
    feeRow("Monthly Fee", monthlyFee);
    feeRow("Arrears", arrears);
    feeRow("Paper Fee", paperFee);
    feeRow("Payable within Due Date", payableWithinDue, true);
    feeRow("Late Fee Charges", lateFee);
    feeRow("Fee After Due Date", payableAfterDue, true);

    y -= 10;
    page.drawText(
      `Amount in Words: ${numberToWords(payableAfterDue)} Only`,
      { x: leftX, y, size: 9, font: bold, color: TEXT }
    );

    /* ================= FOOTER ================= */
    y -= 26;
    page.drawText(
      "Note: Fee must be paid before 10th of every month. After due date, late fee charges will apply.",
      { x: 45, y, size: 8, font, color: MUTED }
    );

    y -= 22;
    page.drawLine({ start: { x: 60, y }, end: { x: 220, y }, thickness: 0.6, color: BORDER });
    page.drawLine({ start: { x: 360, y }, end: { x: 520, y }, thickness: 0.6, color: BORDER });

    page.drawText("Authorized Signature", { x: 60, y: y - 12, size: 9, font, color: MUTED });
    page.drawText("Received By / Date", { x: 360, y: y - 12, size: 9, font, color: MUTED });
  };

  drawCopy(780, "Student Copy");

  page.drawLine({
    start: { x: 35, y: 410 },
    end: { x: 560, y: 410 },
    thickness: 0.8,
    color: BORDER,
    dashArray: [6, 4],
  });

  drawCopy(380, "Office Copy");
}

/* =====================================================
   GET — MONTHLY CLASS PDF
===================================================== */
export async function GET(req) {
  try {
    await dbConnect();
    const user = await getAuthUser(req);

    if (!user || user.role !== "principal") {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!classId || !month || !year) {
      return new Response("Class, month and year required", { status: 400 });
    }

    const vouchers = await FeeVoucher.find({
      campusId: user.campusId,
      classId,
      month,
      year,
    })
      .populate("studentId")
      .populate("classId");

    if (!vouchers.length) {
      return new Response("No vouchers found", { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();

    for (const v of vouchers) {
      await addVoucherPage(pdfDoc, {
        campus: user.campus,
        student: {
          name: v.studentId.name,
          fatherName: v.studentId.fatherName,
          rollNo: v.studentId.rollNumber,
          className: v.classId.className,
        },
        voucher: {
          voucherNo: v.voucherNo, // ✅ PASS VOUCHER NUMBER
          month: v.month,
          year: v.year,
          dueDate: v.dueDate,
          monthlyFee: v.fees.monthlyFee,
          arrearsAmount: v.fees.arrears,
          paperFee: v.fees.paperFee || 0,
        },
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=fee-vouchers-${month}-${year}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF ERROR:", err);
    return new Response("PDF generation failed", { status: 500 });
  }
}
