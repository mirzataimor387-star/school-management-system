import mongoose from "mongoose";

/*
=====================================================
FIXED:
- ❌ Removed ANY top-level await
- ✅ Pure schema + model only
- Compatible with Next.js (Node runtime)
=====================================================
*/

const VoucherCounterSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      index: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/*
=====================================================
One counter per campus per month
=====================================================
*/
VoucherCounterSchema.index(
  { campusId: 1, year: 1, month: 1 },
  { unique: true }
);

export default mongoose.models.VoucherCounter ||
  mongoose.model("VoucherCounter", VoucherCounterSchema);
