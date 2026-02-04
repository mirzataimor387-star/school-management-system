import mongoose from "mongoose";

const feeVoucherSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
      index: true,
    },

    voucherNo: { type: String, required: true },

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

    totals: {
      baseAmount: Number,
      lateAmount: Number,
    },

    received: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

/* ✅ SAFE HOOK — NO next(), NO async+next MIX */
feeVoucherSchema.pre("save", function () {
  const total =
    (this.totals?.baseAmount || 0) +
    (this.totals?.lateAmount || 0);

  if (this.received >= total) this.status = "paid";
  else if (this.received > 0) this.status = "partial";
  else this.status = "unpaid";
});

/* INDEXES */
feeVoucherSchema.index({ campusId: 1, voucherNo: 1 }, { unique: true });
feeVoucherSchema.index({ campusId: 1, studentId: 1, month: 1, year: 1 });

export default mongoose.models.FeeVoucher ||
  mongoose.model("FeeVoucher", feeVoucherSchema);
