// routes/profile.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// 🔹 GET /api/profile - Get user profile
// PUT /api/profile - Update user profile
router.put("/", auth, async (req, res) => {
  try {
    const { phone, doorNumber, buildingName, street, city, state, pincode } = req.body;

    // 1. Get current user data
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const current = rows[0];

    // 2. Build updated fields (keep old if not provided)
    const updatedUser = {
      phone: phone || current.phone,
      doorNumber: doorNumber || current.doorNumber,
      buildingName: buildingName || current.buildingName,
      street: street || current.street,
      city: city || current.city,
      state: state || current.state,
      pincode: pincode || current.pincode,
    };

    // 3. Update only allowed fields (no fullName, no email)
    await db.execute(
      `UPDATE users 
       SET phone = ?, doorNumber = ?, buildingName = ?, 
           street = ?, city = ?, state = ?, pincode = ? 
       WHERE id = ?`,
      [
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

    res.json({ success: true, user: { ...current, ...updatedUser } });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;