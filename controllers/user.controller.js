import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Contact from "../models/contactUs.model.js";
import dotenv from "dotenv";
dotenv.config({});

// ========================= REGISTER =========================
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    console.log("📩 Register API hit");

    const { fullname, email, password, number } = req.body;

    // ===== Validation =====
    if (!fullname || !email || !password || !number) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, and number are required.",
      });
    }

    // Simple email + number validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const numberRegex = /^[0-9]{10}$/; // 10 digit mobile
    if (!numberRegex.test(number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // ===== Check duplicates =====
    const existingUser = await User.findOne({
      $or: [{ email }, { number }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or number.",
      });
    }

    // ===== Hash password =====
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      number,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        number: user.number,
      },
    });
  } catch (error) {
    console.error("❌ Register Error:", error.message);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Server error. Please try again later."
          : error.message,
    });
  }
};



// ========================= LOGIN =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const userData = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
    };

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        success: true,
        message: `Welcome back, ${user.fullname}`,
        user: userData,
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ========================= LOGOUT =========================
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({
        success: true,
        message: "Logged out successfully.",
      });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout.",
    });
  }
};

export const getCurrentUser = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    // Password, tokens, etc. exclude karo
    const { password, refreshToken, ...safeUser } = req.user._doc || req.user;

    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("❌ Error in getCurrentUser:", error.message);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message, // dev me actual error show hoga
    });
  }
};


// ✅ Save contact message
export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newContact = await Contact.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get all contact messages (admin use)
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

