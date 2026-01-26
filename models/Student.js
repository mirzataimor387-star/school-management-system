import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // ======================
    // PERSONAL INFORMATION
    // ======================
    name: {
      type: String,
      required: true,
    },

    fatherName: {
      type: String,
      required: true,
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
      unique: true,
    },

    bForm: {
      type: String,
      default: "", // child CNIC / B-form
    },

    // ======================
    // GUARDIAN INFORMATION
    // ======================
    guardianName: {
      type: String,
      default: "",
    },

    guardianPhone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
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
      required: true, // 2024–2025
    },

    status: {
      type: String,
      enum: ["active", "left", "passed-out"],
      default: "active",
    },

    // ======================
    // SYSTEM
    // ======================
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ roll number unique per class + session
studentSchema.index(
  { rollNumber: 1, classId: 1, session: 1 },
  { unique: true }
);

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
