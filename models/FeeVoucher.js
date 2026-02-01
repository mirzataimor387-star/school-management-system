import mongoose from "mongoose";

const feeVoucherSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
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
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    month: Number,
    year: Number,

    issueDate: Date,
    dueDate: Date,

    fees: {
      monthlyFee: Number,
      paperFee: Number,
      arrears: Number,
      lateFee: Number,
    },

    payableWithinDueDate: Number,
    feeAfterDueDate: Number,

    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

// ❌ duplicate safety
feeVoucherSchema.index(
  { studentId: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.models.FeeVoucher ||
  mongoose.model("FeeVoucher", feeVoucherSchema);
