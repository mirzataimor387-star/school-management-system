import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

/* =====================================================
   SAFE LOGO LOADER (NEVER CRASH)
===================================================== */
function loadLogo(pdfDoc) {
  try {
    // 🔹 CHANGE LOGO FILE NAME HERE IF NEEDED
    const logoPath = path.join(
      process.cwd(),
      "public",
      "leftschool-logo.png" // ✅ ACTUAL FILE
    );

    if (!fs.existsSync(logoPath)) return null;

    const bytes = fs.readFileSync(logoPath);
    return pdfDoc.embedPng(bytes);
  } catch {
    return null;
  }
}

/* =====================================================
   SHARED PDF GENERATOR
===================================================== */
async function generateVoucherPdf({ student, fee }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  /* ===== LOGO (OPTIONAL) ===== */
  const logo = await loadLogo(pdfDoc);

  if (logo) {
    page.drawImage(logo, {
      x: 40,
      y: 780,
      width: 50,
      height: 50,
    });
  }

  /* ===== HEADER ===== */
  page.drawText("YOUR SCHOOL NAME", {
    x: 150,
    y: 805,
    size: 18,
    font: bold,
  });

  page.drawText("FEE VOUCHER", {
    x: 240,
    y: 780,
    size: 14,
    font: bold,
  });

  /* ===== BORDER ===== */
  page.drawRectangle({
    x: 40,
    y: 200,
    width: 515,
    height: 550,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  let y = 720;
  const row = (label, value) => {
    page.drawText(label, { x: 60, y, size: 11, font: bold });
    page.drawText(String(value ?? "-"), { x: 220, y, size: 11, font });
    y -= 22;
  };

  row("Student Name:", student.name);
  row("Class:", student.className);
  row("Roll No:", student.rollNo);
  row("Month:", fee.month);
  row("Due Date:", fee.dueDate);

  y -= 20;

  row("Monthly Fee:", fee.amount);
  row("Late Fee:", fee.lateFee);
  row("Total Payable:", fee.total);

  y -= 40;

  page.drawText("Authorized Signature", {
    x: 380,
    y: 160,
    size: 11,
    font,
  });

  return pdfDoc.save();
}

/* =====================================================
   POST — REAL DOWNLOAD
===================================================== */
export async function POST(req) {
  try {
    const { student, fee } = await req.json();

    if (!student || !fee) {
      return new Response("Invalid payload", { status: 400 });
    }

    const pdfBytes = await generateVoucherPdf({ student, fee });

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=fee-voucher.pdf",
      },
    });
  } catch (err) {
    console.error("PDF POST ERROR:", err);
    return new Response("PDF generation failed", { status: 500 });
  }
}

/* =====================================================
   GET — NEXT.JS PROBING (SAFE)
===================================================== */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const pdfBytes = await generateVoucherPdf({
      student: {
        name: "Student",
        rollNo: "-",
        className: "-",
      },
      fee: {
        month: searchParams.get("month") || "-",
        amount: 0,
        lateFee: 0,
        total: 0,
        dueDate: "-",
      },
    });

    return new Response(pdfBytes, {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch (err) {
    console.error("PDF GET ERROR:", err);
    return new Response("PDF error", { status: 500 });
  }
}
