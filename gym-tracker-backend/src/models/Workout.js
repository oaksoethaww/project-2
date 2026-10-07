import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    exercise: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      enum: ["Strength", "Cardio", "Flexibility", "Other"],
      required: true,
    },
    sets: { type: Number, min: 0, required: true },
    reps: { type: Number, min: 0, required: true },
    weight: { type: Number, min: 0, required: true },
    duration: { type: Number, min: 0, required: true },
    calories: { type: Number, min: 0, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
workoutSchema.index({ userId: 1, date: -1, createdAt: -1 });

export default mongoose.models.Workout ||
  mongoose.model("Workout", workoutSchema);
