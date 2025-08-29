import express from "express";
import Result from "../models/quizResult.model.js";
import Quiz from "../models/addQuiz.model.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { User } from "../models/user.model.js";

const router = express.Router();

/**
 * ✅ Get all quizzes
 */
router.get("/get-all-quizes", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * ✅ Get quiz by ID
 */
router.get("/get-quiz/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    res.json({ success: true, quiz });
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * ✅ Get all results of a specific user
 */
router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate("quizId", "title");

    res.json({ success: true, results });
  } catch (error) {
    console.error("❌ Error fetching user results:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * ✅ Get results of a quiz (with user details + current user)
 */
router.get("/:quizId", isAuthenticated, async (req, res) => {
  try {
    const results = await Result.find({ quizId: req.params.quizId })
      .select("userId score timeTaken");

    const userIds = results.map(r => r.userId);
    const currentUserId = req.id;

    const users = await User.find({ _id: { $in: userIds } })
      .select("fullname email");

    const currentUser = await User.findById(currentUserId)
      .select("fullname email");

    const formattedResults = results.map(r => {
      const user = users.find(u => u._id.toString() === r.userId.toString());
      return {
        name: user?.fullname || "Unknown",
        email: user?.email || "Unknown",
        score: r.score,
        timeTaken: r.timeTaken || 0,
      };
    });

    res.json({
      success: true,
      results: formattedResults,
      currentUser: {
        id: currentUserId,
        email: currentUser?.email || "Unknown",
        name: currentUser?.fullname || "Unknown",
      }
    });
  } catch (error) {
    console.error("❌ Error fetching quiz results:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * ✅ Get all participants of a specific quiz
 */
router.get("/quiz/:quizId/participants", async (req, res) => {
  try {
    const { quizId } = req.params;

    const participants = await Result.find({ quizId })
      .populate("userId", "fullname email") // corrected: fullname
      .populate("quizId", "title");

    if (!participants || participants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No participants found for this quiz",
      });
    }

    res.json({
      success: true,
      quiz: participants[0].quizId.title,
      totalParticipants: participants.length,
      participants: participants.map((p) => ({
        name: p.userId.fullname,
        email: p.userId.email,
        score: p.score,
        totalQuestions: p.totalQuestions,
        correctAnswers: p.correctAnswers,
        submittedAt: p.submittedAt,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching participants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * ✅ Submit quiz answers
 */
router.post("/submit", isAuthenticated, async (req, res) => {
  try {
    const { quizId, score, timeTaken } = req.body;
    const userId = req.id;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "quizId is required",
      });
    }

    const newResult = new Result({
      userId,
      quizId,
      score,
      timeTaken,
    });

    await newResult.save();
    res.status(201).json({ success: true, result: newResult });
  } catch (error) {
    console.error("❌ Error while submitting quiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * ✅ Check if user already attempted a quiz
 */
router.get("/check/:quizId", isAuthenticated, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;

    const existingResult = await Result.findOne({ userId, quizId });

    if (existingResult) {
      return res.json({
        success: true,
        attempted: true,
        message: "User has already attempted this quiz",
        result: {
          score: existingResult.score,
          timeTaken: existingResult.timeTaken,
          submittedAt: existingResult.submittedAt,
        },
      });
    }

    res.json({
      success: true,
      attempted: false,
      message: "User has not attempted this quiz yet",
    });
  } catch (error) {
    console.error("❌ Error checking quiz attempt:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
