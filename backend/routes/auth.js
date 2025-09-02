const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");
const { sendResetEmail } = require("../utils/emailService");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

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

    // Check if user already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
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
    const [rows] = await db.query(
      `SELECT id, fullName, email, phone, doorNumber, buildingName, street, city, state, pincode 
       FROM users WHERE id = ?`,
      [userId]
    );

    const user = rows[0];

    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // Remove password before sending user object
    delete user.password;

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const [users] = await db.query("SELECT id, fullName FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      // If you prefer privacy-preserving behavior, return 200 here instead.
      return res.status(400).json({ success: false, message: "Invalid email. This email is not registered." });
    }

    const user = users[0];

    // Generate token + store hashed version
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiration = ? WHERE id = ?",
      [resetTokenHash, resetTokenExpiration, user.id]
    );

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // 🔑 DEV: log the link for quick testing
    console.log("🔑 Reset link (copy into browser):", resetUrl);

    // Send email (optional in dev)
    await sendResetEmail(email, resetUrl, user.fullName);

    return res.json({ success: true, message: "Password reset link has been sent to your email." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// 🔹 RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpiration > NOW()",
      [email, resetTokenHash]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiration = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// 🔹 VERIFY RESET TOKEN (optional endpoint for frontend validation)
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and email are required' 
      });
    }

    // Hash the provided token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Check if token is valid and not expired
    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpiration > NOW()",
      [email, resetTokenHash]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Reset token is valid' 
    });
    
  } catch (err) {
    console.error("❌ Verify reset token error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;