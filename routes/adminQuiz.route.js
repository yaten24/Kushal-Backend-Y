import express from "express";
import Result from "../models/quizResult.model.js";
import Quiz from "../models/addQuiz.model.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// Create new quiz
router.post("/addquiz", async (req, res) => {
  try {
    const { title, questions } = req.body;

    const newQuiz = new Quiz({ title, questions });
    await newQuiz.save();

    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔥 Delete all results
router.delete("/delete-all-results", async (req, res) => {
  try {
    await Result.deleteMany({});
    res.json({ success: true, message: "All results deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting results" });
  }
});

// 🔥 Delete all users
router.delete("/delete-all-users", async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ success: true, message: "All users deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting users" });
  }
});

export default router;
