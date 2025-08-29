import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,createContact,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

/**
 * @route   POST /api/v1/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/v1/user/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/v1/user/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get("/verify", isAuthenticated, getCurrentUser);

/**
 * @route   GET /api/v1/user/logout
 * @desc    Logout user (clear cookies)
 * @access  Private
 */
router.get("/logout", isAuthenticated, logout);

// @route   POST /api/v1/user/contact
router.post("/contact", createContact);

export default router;
