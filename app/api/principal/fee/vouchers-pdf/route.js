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
=====================================================
*/

export const runtime = "nodejs";

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import StudentFeeAdjustment from "@/models/StudentFeeAdjustment";
import { getAuthUser } from "@/utils/getAuthUser";

const LOGO_LEFT =
  "https://res.cloudinary.com/dmpppmbyx/image/upload/v1769922018/school-logo_aseuug.png";

const LOGO_RIGHT =
  "https://res.cloudinary.com/dmpppmbyx/image/upload/v1769922030/school-sublogo_koycya.png";

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
      <td class="label">Student</td>
      <td>{{STUDENT}}</td>
      <td class="label">Father</td>
      <td>{{FATHER}}</td>
    </tr>
    <tr>
      <td class="label">Roll No</td>
      <td>{{ROLL}}</td>
      <td class="label">Class</td>
      <td>{{CLASS}}</td>
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

  <div class="note">
    Fee must be paid before 10th of every month.
  </div>
</div>
`;

export async function GET(req) {
  await dbConnect();

  const user = await getAuthUser(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

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

  const template = fs.readFileSync(
    path.join(process.cwd(), "templates/fee-voucher.html"),
    "utf8"
  );

  const monthName = new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
  });

  let html = "";

  /* =================================================
     🔥 IMPORTANT: for...of (async safe)
     ================================================= */
  for (const v of vouchers) {
    // 🔥 READ DISCOUNT / EXTRA FEE
    const adjustment = await StudentFeeAdjustment.findOne({
      campusId: v.campusId,
      studentId: v.studentId?._id,
      classId: v.classId?._id,
      month: v.month,
      year: v.year,
    }).lean();

    const discount = adjustment?.discount || 0;
    const extraFee = adjustment?.extraFee || 0;

    // 🔥 PAYABLE (READ-ONLY CALCULATION)
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

  const finalHtml = template.replace("{{VOUCHER_CONTENT}}", html);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(finalHtml, { waitUntil: "networkidle0" });

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
}
