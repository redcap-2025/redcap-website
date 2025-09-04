const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/db"); // Ensure correct path
const { sendResetEmail } = require("../utils/emailService");

const router = express.Router();

// 🔐 Use JWT_SECRET from environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in environment variables");
  process.exit(1);
}

// ✅ Add route prefix validation
console.log("✅ Auth routes loaded with correct configuration");

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
    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: email, password, fullName, or phone" 
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid email address" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Check if user already exists
    const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
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
        buildingName,
        street,
        city,
        state,
        pincode,
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
    console.error("❌ Register error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password required" 
      });
    }

    // Find user by email
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Sign token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // Remove sensitive data
    delete user.password;
    delete user.resetToken;
    delete user.resetTokenExpiration;

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid email address" 
      });
    }

    const [users] = await db.execute("SELECT id, fullName FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is not registered with us." 
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

    // ✅ Fixed: Remove trailing spaces and use correct environment variable
    const FRONTEND_URL = process.env.FRONTEND_URL?.trim() || "https://recapweb.netlify.app";
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // 🔑 DEV: Log only in development
    if (process.env.NODE_ENV !== "production") {
      console.log("🔑 Reset link (for testing):", resetUrl);
    }

    try {
      await sendResetEmail(email, resetUrl, user.fullName);
      return res.json({ 
        success: true, 
        message: "Password reset link has been sent to your email." 
      });
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr.message);
      // Still return success to prevent email enumeration attacks
      return res.json({ 
        success: true, 
        message: "If your email is registered, you'll receive a reset link." 
      });
    }
  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields are required" 
    });
  }

  // Enhanced password validation
  if (password.length < 8) {
    return res.status(400).json({ 
      success: false, 
      message: "Password must be at least 8 characters long" 
    });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({ 
      success: false, 
      message: "Password must include uppercase, lowercase, and number" 
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
        message: "Invalid or expired token" 
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
      message: "Password reset successful" 
    });
  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 VERIFY RESET TOKEN (Frontend pre-check)
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Token and email required" 
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
        message: "Invalid or expired token" 
      });
    }

    res.json({ 
      success: true, 
      message: "Token is valid" 
    });
  } catch (err) {
    console.error("❌ Verify reset token error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;