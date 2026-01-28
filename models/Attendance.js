// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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

        session: {
            type: String,
            required: true, // 2024-2025
        },

        date: {
            type: String, // 2026-01-27
            required: true,
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // teacher
            required: true,
        },

        records: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                    required: true,
                },

                status: {
                    type: String,
                    enum: ["present", "absent", "leave"],
                    default: "present",
                },
            },
        ],
    },
    { timestamps: true }
);

/* ======================================
   CRITICAL INDEX — NO DUPLICATES
====================================== */

attendanceSchema.index(
    {
        campusId: 1,
        classId: 1,
        session: 1,
        date: 1,
    },
    { unique: true }
);

export default mongoose.models.Attendance ||
    mongoose.model("Attendance", attendanceSchema);
