const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// GET profile
router.get("/profile", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE profile
// UPDATE profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, doorNumber, buildingName, street, city, state, pincode } = req.body;

    // 1. Get current user data
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const current = rows[0];

    // 2. Keep old value if not provided
    const updatedUser = {
      fullName: name ?? current.fullName,
      phone: phone ?? current.phone,
      doorNumber: doorNumber ?? current.doorNumber,
      buildingName: buildingName ?? current.buildingName,
      street: street ?? current.street,
      city: city ?? current.city,
      state: state ?? current.state,
      pincode: pincode ?? current.pincode,
    };

    // 3. Update
    await db.query(
      `UPDATE users 
         SET fullName=?, phone=?, doorNumber=?, buildingName=?, street=?, city=?, state=?, pincode=? 
       WHERE id=?`,
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
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
