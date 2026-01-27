import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // 🔥 CURRENT ACADEMIC SESSION
    currentSession: {
      type: String,
      required: true, // e.g. "2024-2025"
    },

    // one campus → one principal
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Campus ||
  mongoose.model("Campus", campusSchema);
