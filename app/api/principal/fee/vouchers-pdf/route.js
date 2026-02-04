/*
=====================================================
FINAL PDF API (LOCKED & ACCOUNTING-CORRECT)

✔ classId supported
✔ Discount shown (StudentFeeAdjustment)
✔ Extra Fee shown
✔ Late Fee OFF
✔ Payable recalculated (safe)
✔ Async DB calls fixed
✔ Preview === Generate === PDF
✔ LOCAL + VERCEL SAFE (FINAL, FIXED)
=====================================================
*/

export const runtime = "nodejs";

import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";
import { getAuthUser } from "@/utils/getAuthUser";

/* ===============================
   🔴 REQUIRED FOR VERCEL
================================ */
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

/* ===============================
   LOGOS (ABSOLUTE URL)
================================ */
const LOGO_LEFT =
  "https://res.cloudinary.com/dmpppmbyx/image/upload/v1769922018/school-logo_aseuug.png";

const LOGO_RIGHT =
  "https://res.cloudinary.com/dmpppmbyx/image/upload/v1769922030/school-sublogo_koycya.png";

/* ===============================
   BASE HTML TEMPLATE
================================ */
const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
body { font-family: Arial, sans-serif; margin:0; padding:0; }
.page { page-break-after: always; padding:20px; }
.copy-box { border:1px solid #000; padding:12px; margin-bottom:10px; }
.header { display:flex; justify-content:space-between; align-items:center; }
.header img { height:60px; }
.school-name { font-size:16px; font-weight:bold; text-align:center; }
.title { font-size:14px; text-align:center; }
.copy { font-size:12px; text-align:center; margin-top:4px; }
table { width:100%; border-collapse:collapse; margin-top:10px; }
td { border:1px solid #000; padding:6px; font-size:12px; }
.label { font-weight:bold; width:25%; }
.fee-table td { width:50%; }
.note { margin-top:10px; font-size:11px; text-align:center; }
.cut-line { text-align:center; margin:10px 0; font-size:12px; }
</style>
</head>
<body>
{{VOUCHER_CONTENT}}
</body>
</html>
`;

/* ===============================
   SINGLE COPY TEMPLATE
================================ */
const singleCopy = `
<div class="copy-box">
  <div class="header">
    <img src="${LOGO_LEFT}" />
    <div>
      <div class="school-name">THE ASIAN SCHOOL & COLLEGE</div>
      <div class="title">MONTHLY FEE VOUCHER</div>
      <div class="copy">{{COPY}}</div>
    </div>
    <img src="${LOGO_RIGHT}" />
  </div>

  <table>
    <tr>
      <td class="label">Student</td><td>{{STUDENT}}</td>
      <td class="label">Father</td><td>{{FATHER}}</td>
    </tr>
    <tr>
      <td class="label">Roll No</td><td>{{ROLL}}</td>
      <td class="label">Class</td><td>{{CLASS}}</td>
    </tr>
    <tr>
      <td class="label">Month</td>
      <td colspan="3">{{MONTH}}</td>
    </tr>
  </table>

  <table class="fee-table">
    <tr><td class="label">Monthly Fee</td><td>{{MF}}</td></tr>
    <tr><td class="label">Arrears</td><td>{{AR}}</td></tr>
    <tr><td class="label">Extra Fee</td><td>{{EF}}</td></tr>
    <tr><td class="label">Discount</td><td>-{{DIS}}</td></tr>
    <tr><td class="label">Late Fee</td><td>0</td></tr>
    <tr><td class="label">Payable</td><td>{{PWD}}</td></tr>
  </table>

  <div class="note">Fee must be paid before 10th of every month.</div>
</div>
`;

/* ===============================
   GET API
================================ */
export async function GET(req) {
  try {
    await dbConnect();

    const user = await getAuthUser(req);
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));
    const classId = searchParams.get("classId");

    if (!month || !year) {
      return new Response("Month and year required", { status: 400 });
    }

    const vouchers = await FeeVoucher.find({
      campusId: user.campusId,
      ...(classId && { classId }),
      month,
      year,
    })
      .populate("studentId")
      .populate("classId");

    if (!vouchers.length) {
      return new Response("No vouchers found", { status: 404 });
    }

    const monthName = new Date(year, month - 1).toLocaleString("en-US", {
      month: "long",
    });

    let html = "";

    for (const v of vouchers) {
      const adjustment = await StudentFeeAdjustment.findOne({
        campusId: v.campusId,
        studentId: v.studentId?._id,
        classId: v.classId?._id,
        month: v.month,
        year: v.year,
      }).lean();

      const discount = adjustment?.discount || 0;
      const extraFee = adjustment?.extraFee || 0;

      const payable = Math.max(
        0,
        (v.fees?.monthlyFee || 0) +
          (v.fees?.arrears || 0) +
          extraFee -
          discount
      );

      const base = singleCopy
        .replace("{{STUDENT}}", v.studentId?.name || "")
        .replace("{{FATHER}}", v.studentId?.fatherName || "")
        .replace("{{ROLL}}", v.studentId?.rollNumber || "")
        .replace("{{CLASS}}", v.classId?.className || "")
        .replace("{{MONTH}}", `${monthName} ${year}`)
        .replace("{{MF}}", v.fees?.monthlyFee || 0)
        .replace("{{AR}}", v.fees?.arrears || 0)
        .replace("{{EF}}", extraFee)
        .replace("{{DIS}}", discount)
        .replace("{{PWD}}", payable);

      html += `
        <div class="page">
          ${base.replace("{{COPY}}", "OFFICE COPY")}
          <div class="cut-line">✂ CUT HERE</div>
          ${base.replace("{{COPY}}", "STUDENT COPY")}
        </div>
      `;
    }

    const finalHtml = baseTemplate.replace("{{VOUCHER_CONTENT}}", html);

    /* ===============================
       🔥 FINAL BROWSER LAUNCH
       (THIS FIXES YOUR ERROR)
    ================================= */
    const isVercel = !!process.env.VERCEL;
    let browser;

    if (!isVercel) {
      // LOCAL
      const puppeteer = (await import("puppeteer")).default;
      browser = await puppeteer.launch({ headless: true });
    } else {
      // VERCEL
      const executablePath = await chromium.executablePath({
        cacheDir: "/tmp",
      });

      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "load" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=fee-vouchers-${month}-${year}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF GENERATION ERROR 👉", err);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
