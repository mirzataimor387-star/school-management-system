import mongoose from "mongoose";

const feeCycleSchema = new mongoose.Schema({
    campusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campus",
        required: true,
    },

    month: Number,
    year: Number,

    issueDate: Date,
    dueDate: Date,

    status: {
        type: String,
        enum: ["draft", "generated", "locked"],
        default: "draft",
    },

    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

feeCycleSchema.index(
    { campusId: 1, month: 1, year: 1 },
    { unique: true }
);

export default mongoose.models.FeeCycle ||
    mongoose.model("FeeCycle", feeCycleSchema);
