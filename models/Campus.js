import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
  {
    // 🏫 SCHOOL NAME (same for all campuses)
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },

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

    currentSession: {
      type: String,
      required: true,
    },

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
