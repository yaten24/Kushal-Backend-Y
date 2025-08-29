import express from "express";
import Result from "../models/quizResult.model.js";
import Quiz from "../models/addQuiz.model.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// Get all quizzes
router.get("/get-all-quizes", async (req, res) => {
  try {
    console.log("aa gya bhai main");
    const quizzes = await Quiz.find();
    console.log(quizzes);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get quiz by ID
router.get("/get-quiz/:id", async (req, res) => {
  try {
    console.log("aa gya bhai")
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    console.log("bhai database se quiz ka data aa gya hai")
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all results of a user
router.get("/user/:userId", isAuthenticated , async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId }).populate("quizId", "title");
    res.json(results);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get results of a quiz (with user name + email + score)
router.get("/:quizId", isAuthenticated, async (req, res) => {
  try {
    // ✅ Saare results nikal lo (with timeTaken)
    const results = await Result.find({ quizId: req.params.quizId })
      .select("userId score timeTaken");

    // ✅ Saare userIds collect karo
    const userIds = results.map(r => r.userId);
    const currentUserId = req.id;

    // ✅ Un sab users ki detail laao
    const users = await User.find({ _id: { $in: userIds } })
      .select("fullname email");

    // ✅ Current user ki detail laao
    const currentUser = await User.findById(currentUserId)
      .select("fullname email");

    // ✅ userId ke basis pe merge karo
    const formattedResults = results.map(r => {
      const user = users.find(u => u._id.toString() === r.userId.toString());
      return {
        name: user?.fullname || "Unknown",
        email: user?.email || "Unknown",
        score: r.score,
        timeTaken: r.timeTaken || 0, // 👈 ye add kiya
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




// Get all participants of a specific quiz
router.get("/quiz/:quizId/participants", async (req, res) => {
  try {
    const { quizId } = req.params;

    // Find all results of this quiz
    const participants = await Result.find({ quizId })
      .populate("userId", "name email")  // only name & email from User model
      .populate("quizId", "title");      // quiz title

    if (!participants || participants.length === 0) {
      return res.status(404).json({ message: "No participants found for this quiz" });
    }

    res.json({
      quiz: participants[0].quizId.title,
      totalParticipants: participants.length,
      participants: participants.map((p) => ({
        user: p.userId.name,
        email: p.userId.email,
        score: p.score,
        totalQuestions: p.totalQuestions,
        correctAnswers: p.correctAnswers,
        submittedAt: p.submittedAt
      }))
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit quiz answers
router.post("/submit", isAuthenticated, async (req, res) => {
  try {
    const { quizId, score , timeTaken } = req.body;
    const userId = req.id;
    if (!quizId) {
      return res.status(400).json({ success: false, message: "quizId is required" });
    }
    console.log(timeTaken)
    const newResult = new Result({
      userId,
      quizId,
      score,
      timeTaken,
    });

    await newResult.save();
    res.status(201).json({ success: true, result: newResult });
  } catch (error) {
    console.error("Error while submitting quiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});





export default router;
