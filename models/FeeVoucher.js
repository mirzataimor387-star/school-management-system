import mongoose from "mongoose";

const feeVoucherSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
      index: true,
    },

    voucherNo: {
      type: String,
      required: true,
      unique: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    month: { type: Number, required: true }, // 1–12
    year: { type: Number, required: true },

    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },

    fees: {
      monthlyFee: { type: Number, default: 0 },
      paperFee: { type: Number, default: 0 },
      arrears: { type: Number, default: 0 },
      lateFee: { type: Number, default: 0 },
    },

    totals: {
      baseAmount: { type: Number, default: 0 },
      lateAmount: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
      index: true,
    },
  },
  { timestamps: true }
);

feeVoucherSchema.index(
  { campusId: 1, studentId: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.models.FeeVoucher ||
  mongoose.model("FeeVoucher", feeVoucherSchema);
