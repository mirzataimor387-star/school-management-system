export const runtime = "nodejs";

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import dbConnect from "@/utils/connectdb";
import FeeVoucher from "@/models/FeeVoucher";
import { getAuthUser } from "@/utils/getAuthUser";

const LOGO_LEFT =
    "https://res.cloudinary.com/dmpppmbyx/image/upload/v1769922018/school-logo_aseuug.png";

const LOGO_RIGHT =
    "https://res.cloudinary.com/dmpppmbyx/image/upload/v1769922030/school-sublogo_koycya.png";

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
    <tr><td class="label">Paper Fee</td><td>{{PF}}</td></tr>
    <tr><td class="label">Late Fee</td><td>{{LF}}</td></tr>
    <tr><td class="label">Payable</td><td>{{PWD}}</td></tr>
  </table>

  <div class="note">
    Fee must be paid before 10th of every month.
  </div>
</div>
`;

export async function GET(req) {
    await dbConnect();
    const user = await getAuthUser();

    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    const vouchers = await FeeVoucher.find({
        campusId: user.campusId,
        month,
        year,
    })
        .populate("studentId")
        .populate("classId");

    const template = fs.readFileSync(
        path.join(process.cwd(), "templates/fee-voucher.html"),
        "utf8"
    );

    const monthName = new Date(year, month - 1).toLocaleString("en-US", {
        month: "long",
    });

    let html = "";

    vouchers.forEach(v => {
        const base = singleCopy
            .replace("{{STUDENT}}", v.studentId?.name || "")
            .replace("{{FATHER}}", v.studentId?.fatherName || "")
            .replace("{{ROLL}}", v.studentId?.rollNumber || "")
            .replace("{{CLASS}}", v.classId?.className || "")
            .replace("{{MONTH}}", `${monthName} ${year}`)
            .replace("{{MF}}", v.fees?.monthlyFee || 0)
            .replace("{{AR}}", v.fees?.arrears || 0)
            .replace("{{PF}}", v.fees?.paperFee || 0)
            .replace("{{LF}}", v.fees?.lateFee || 0)
            .replace("{{PWD}}", v.payableWithinDueDate || 0);

        html += `
      <div class="page">
        ${base.replace("{{COPY}}", "OFFICE COPY")}
        <div class="cut-line">✂ CUT HERE</div>
        ${base.replace("{{COPY}}", "STUDENT COPY")}
      </div>
    `;
    });

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
            "Content-Disposition": "attachment; filename=fee-vouchers.pdf",
        },
    });
}
