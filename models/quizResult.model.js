// models/Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  quizId: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  timeTaken:{
    type: Number,
    required: true,
    default: 0,
  },
  attemptedAt: {
    type: Date,
    default: Date.now, // quiz attempt time
  },
});

export default mongoose.model("Result", resultSchema);
