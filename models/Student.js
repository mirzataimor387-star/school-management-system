import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // ======================
    // PERSONAL INFORMATION
    // ======================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    studentPhoto: {
      type: String,
      default: "/student.png",
    },

    // ======================
    // IDENTITY INFORMATION
    // ======================
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
    },

    bForm: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================
    // GUARDIAN INFORMATION
    // ======================
    guardianName: {
      type: String,
      default: "",
      trim: true,
    },

    guardianPhone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================
    // ACADEMIC INFORMATION
    // ======================
    rollNumber: {
      type: Number,
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    session: {
      type: String,
      required: true, // e.g. 2024–2025
    },

    status: {
      type: String,
      enum: ["active", "left", "passed-out"],
      default: "active",
    },

    // ======================
    // SYSTEM / AUDIT
    // ======================
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* =====================================================
   INDEXES (VERY IMPORTANT)
===================================================== */

// ✅ roll number unique per class + session
studentSchema.index(
  { rollNumber: 1, classId: 1, session: 1 },
  { unique: true }
);

// ✅ admission number unique per campus
studentSchema.index(
  { admissionNumber: 1, campusId: 1 },
  { unique: true }
);

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
