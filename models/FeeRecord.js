import mongoose from "mongoose";

const feeRecordSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
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

    month: {
      type: String, // Jan, Feb
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.FeeRecord ||
  mongoose.model("FeeRecord", feeRecordSchema);
