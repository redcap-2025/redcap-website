// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/db"); // Ensure correct path
const { sendResetEmail } = require("../utils/emailService");

const router = express.Router();

// 🔐 Validate JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET is not set in environment variables");
  console.error("Authentication will NOT work without JWT_SECRET");
} else {
  console.log("✅ JWT_SECRET is configured");
}

// 🌐 Validate FRONTEND_URL
const FRONTEND_URL = process.env.FRONTEND_URL?.trim();
if (!FRONTEND_URL) {
  console.warn("🔶 WARNING: FRONTEND_URL is not set. Using fallback.");
}
const FINAL_FRONTEND_URL = FRONTEND_URL || "https://recapweb.netlify.app";
console.log(`🌐 Frontend URL: ${FINAL_FRONTEND_URL}`);

// ✅ Health check route (optional, for debugging)
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Auth service is running" });
});

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      doorNumber,
      buildingName,
      street,
      city,
      state,
      pincode,
    } = req.body;

    // Enhanced validation
    if (!email || !password || !fullName || !phone || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, password, fullName, phone, or pincode",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be a 6-digit number",
      });
    }

    // Check if user already exists
    const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.execute(
      `INSERT INTO users 
        (fullName, email, phone, password, doorNumber, buildingName, street, city, state, pincode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        phone,
        hashedPassword,
        doorNumber,
        buildingName || null,
        street,
        city,
        state,
        pincode.toString(),
      ]
    );

    const userId = result.insertId;

    // Fetch inserted user (without password)
    const [rows] = await db.execute(
      `SELECT id, fullName, email, phone, doorNumber, buildingName, street, city, state, pincode 
       FROM users WHERE id = ?`,
      [userId]
    );

    const user = rows[0];

    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Register error details:", {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    delete user.password;
    delete user.resetToken;
    delete user.resetTokenExpiration;

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Login error details:", {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 🔹 FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // ✅ SECURITY: Always return success unless format is invalid
    const [users] = await db.execute("SELECT id, fullName FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: "If your email is registered, you'll receive a reset link.",
      });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.execute(
      "UPDATE users SET resetToken = ?, resetTokenExpiration = ? WHERE id = ?",
      [resetTokenHash, resetTokenExpiration, user.id]
    );

    // ✅ FIXED: Clean URL with no trailing spaces
    const resetUrl = `${REACT_APP_FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // 🔑 DEV: Log only in development
    if (process.env.NODE_ENV !== "production") {
      console.log("🔑 Reset link (for testing):", resetUrl);
    }

    try {
      await sendResetEmail(email, resetUrl, user.fullName);
      console.log(`✅ Reset email sent to ${email}`);
    } catch (emailErr) {
      console.error("❌ Email sending failed:", {
        message: emailErr.message,
        stack: emailErr.stack,
      });
      // Continue — don't fail the request
    }

    // ✅ Always return generic success
    return res.json({
      success: true,
      message: "If your email is registered, you'll receive a reset link.",
    });
  } catch (err) {
    console.error("❌ Forgot password error details:", {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 🔹 RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Enhanced password validation
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must include uppercase, lowercase, and number",
    });
  }

  const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const [users] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpiration > NOW()",
      [email, resetTokenHash]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiration = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("❌ Reset password error details:", {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 🔹 VERIFY RESET TOKEN (Frontend pre-check)
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email required",
      });
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [users] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpiration > NOW()",
      [email, resetTokenHash]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
    });
  } catch (err) {
    console.error("❌ Verify reset token error details:", {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;