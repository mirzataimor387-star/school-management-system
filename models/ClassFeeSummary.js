import mongoose from "mongoose";

const ClassFeeSummarySchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    // 🔥 ALWAYS NUMBER (1–12)
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
      set: v => Number(v), // 🔥 FORCE CAST
    },

    year: {
      type: Number,
      required: true,
      index: true,
    },

    totalFee: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
    totalPending: { type: Number, default: 0 },
    totalVouchers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* 🔒 NO DUPLICATES EVER */
ClassFeeSummarySchema.index(
  { campusId: 1, classId: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.models.ClassFeeSummary ||
  mongoose.model("ClassFeeSummary", ClassFeeSummarySchema);
