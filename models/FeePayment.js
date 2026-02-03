import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeVoucher",
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    method: {
      type: String,
      enum: ["cash", "bank", "online"],
      required: true,
    },

    receivedAt: {
      type: Date,
      required: true,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.FeePayment ||
  mongoose.model("FeePayment", feePaymentSchema);
