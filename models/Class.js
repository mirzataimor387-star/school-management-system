import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      required: true,
    },

    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    session: {
      type: String,
      required: true,
    },

    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

classSchema.index(
  { className: 1, section: 1, campusId: 1, session: 1 },
  { unique: true }
);

export default mongoose.models.Class ||
  mongoose.model("Class", classSchema);
