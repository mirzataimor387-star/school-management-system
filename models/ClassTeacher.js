import mongoose from "mongoose";

const ClassTeacherSchema = new mongoose.Schema(
    {
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },

        subject: {
            type: String,
            required: true,
        },

        session: {
            type: String,
            required: true,
        },

        campusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campus",
            required: true,
        },
    },
    { timestamps: true }
);

ClassTeacherSchema.index(
    { teacherId: 1, classId: 1, subject: 1, session: 1 },
    { unique: true }
);

export default mongoose.models.ClassTeacher ||
    mongoose.model("ClassTeacher", ClassTeacherSchema);
