import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    monthlyFee: {
      type: Number,
      required: true,
    },

    paperFee: {
      type: Number,
      default: 0,
    },

    arrears: {
      type: Number,
      default: 0,
    },

    lateFee: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.models.FeeStructure ||
  mongoose.model("FeeStructure", feeStructureSchema);
