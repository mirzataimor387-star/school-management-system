import dbConnect from "@/utils/connectdb";
import { getAuthUser } from "@/utils/getAuthUser";

import Class from "@/models/Class";
import Student from "@/models/Student";
import FeeVoucher from "@/models/FeeVoucher";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔐 AUTH CONTEXT (REAL LOGIN USER)
    const auth = await getAuthUser();

    if (!auth) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    if (!auth.isPrincipal) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized: Principal access only",
        }),
        { status: 403 }
      );
    }

    if (!auth.campusId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Principal has no campus assigned",
        }),
        { status: 400 }
      );
    }

    const campusId = auth.campusId;

    // 🔹 All classes of campus
    const classes = await Class.find({ campusId });

    const result = [];

    for (const cls of classes) {
      // 🔹 All students of class
      const students = await Student.find({
        campusId,
        classId: cls._id,
      });

      const studentsWithVouchers = [];

      for (const stu of students) {
        // 🔹 All vouchers of student
        const vouchers = await FeeVoucher.find({
          campusId,
          classId: cls._id,
          studentId: stu._id,
        }).sort({ year: -1, month: -1 });

        studentsWithVouchers.push({
          studentId: stu._id,
          name: stu.name,
          rollNo: stu.rollNumber,
          vouchers: vouchers.map(v => ({
            voucherId: v._id,
            voucherNo: v.voucherNo,
            month: v.month,
            year: v.year,
            total:
              (v.totals?.baseAmount || 0) +
              (v.totals?.lateAmount || 0),
            status: v.status,
            dueDate: v.dueDate,
          })),
        });
      }

      result.push({
        classId: cls._id,
        className: cls.className,
        students: studentsWithVouchers,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        principal: {
          id: auth.id,
          name: auth.user.name,
          email: auth.user.email,
        },
        campus: auth.campus,
        classes: result,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("PRINCIPAL DASHBOARD ERROR:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
