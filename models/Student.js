import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    rollNumber: {
      type: Number,
      required: true,
    },

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

    session: {
      type: String,
      required: true, // 2024–2025
    },

    status: {
      type: String,
      enum: ["active", "left", "passed-out"],
      default: "active",
    },
  },
  { timestamps: true }
);

// unique roll number per class per session
studentSchema.index(
  { rollNumber: 1, classId: 1, session: 1 },
  { unique: true }
);

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
