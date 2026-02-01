import mongoose from "mongoose";

const studentFeeAdjustmentSchema = new mongoose.Schema(
  {
    campusId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    classId: mongoose.Schema.Types.ObjectId,
    month: Number,
    year: Number,
    discount: { type: Number, default: 0 },
    extraFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

studentFeeAdjustmentSchema.index(
  { studentId: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.models.StudentFeeAdjustment ||
  mongoose.model("StudentFeeAdjustment", studentFeeAdjustmentSchema);
