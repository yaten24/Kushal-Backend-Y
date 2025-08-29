import express from "express";
import Quiz from "../models/addQuiz.model.js";

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

export default router;
