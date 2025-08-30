import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    // Token extract from cookies or Authorization header
    const token =
      req.cookies?.token ||
      (req.headers["authorization"] &&
        req.headers["authorization"].split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    if (!process.env.SECRET_KEY) {
      console.error("❌ SECRET_KEY not set in environment variables");
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    // Verify token
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode)

    // Attach user id to request
    req.id = decode.userId;

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

export default isAuthenticated;
