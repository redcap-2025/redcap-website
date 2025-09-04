// routes/profile.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// 🔹 GET /api/profile - Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    // Use execute() for better security and connection stability
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove sensitive fields before sending
    const { password, resetToken, resetTokenExpiration, ...user } = rows[0];
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 PUT /api/profile - Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, doorNumber, buildingName, street, city, state, pincode } = req.body;

    // 1. Get current user data
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const current = rows[0];

    // 2. Build updated fields (keep old if not provided)
    const updatedUser = {
      fullName: name || current.fullName,
      phone: phone || current.phone,
      doorNumber: doorNumber || current.doorNumber,
      buildingName: buildingName || current.buildingName,
      street: street || current.street,
      city: city || current.city,
      state: state || current.state,
      pincode: pincode || current.pincode,
    };

    // 3. Update in DB
    await db.execute(
      `UPDATE users 
       SET fullName = ?, phone = ?, doorNumber = ?, buildingName = ?, 
           street = ?, city = ?, state = ?, pincode = ? 
       WHERE id = ?`,
      [
        updatedUser.fullName,
        updatedUser.phone,
        updatedUser.doorNumber,
        updatedUser.buildingName,
        updatedUser.street,
        updatedUser.city,
        updatedUser.state,
        updatedUser.pincode,
        req.user.id,
      ]
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;