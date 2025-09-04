// backend/routes/bookings.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ensure correct path
const auth = require("../middleware/auth");

/** Helper: Generate tracking code */
function makeTrackingCode() {
  const rand = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(5, "0");
  return `RC${Date.now().toString(36).toUpperCase()}${rand}`;
}

/** Coerce empty strings to null */
const nn = (v) => (v === "" || v === undefined ? null : v);

/** Minimal body validation */
function requireFields(obj, fields) {
  return fields.filter((f) => !obj[f] && obj[f] !== 0 && obj[f] !== false);
}

/** Map frontend fields → DB schema */
function mapToDb(body, userId, trackingCode, status, serviceType) {
  return [
    userId,
    trackingCode,
    status,

    nn(body.senderName),
    nn(body.senderPhone),
    nn(body.pickupDoorNumber),
    nn(body.pickupBuildingName),
    nn(body.pickupStreet),
    nn(body.pickupCity),
    nn(body.pickupState),
    nn(body.pickupPincode),

    nn(body.receiverName),
    nn(body.receiverPhone),
    nn(body.deliveryDoorNumber),
    nn(body.deliveryBuildingName),
    nn(body.deliveryStreet),
    nn(body.deliveryCity),
    nn(body.deliveryState),
    nn(body.deliveryPincode),

    nn(body.description),
    nn(body.packageType),
    nn(body.vehicleType),
    serviceType,
    nn(body.pickupDate),
  ];
}

// 🔹 POST /api/bookings - Create a new booking
router.post("/bookings", auth, async (req, res) => {
  try {
    const body = req.body || {};
    const userId = req.user.id;

    const required = [
      "senderName",
      "senderPhone",
      "pickupDoorNumber",
      "pickupStreet",
      "pickupCity",
      "pickupState",
      "pickupPincode",
      "receiverName",
      "receiverPhone",
      "deliveryDoorNumber",
      "deliveryStreet",
      "deliveryCity",
      "deliveryState",
      "deliveryPincode",
      "vehicleType",
      "packageType",
      "pickupDate",
    ];

    const missing = requireFields(body, required);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const trackingCode = makeTrackingCode();
    const status = "Pending";
    const serviceType = nn(body.serviceType);

    const cols = [
      "userId", "trackingCode", "status",
      "pickupName", "pickupPhone", "pickupDoorNumber", "pickupBuildingName",
      "pickupStreet", "pickupCity", "pickupState", "pickupPincode",
      "dropoffName", "dropoffPhone", "dropoffDoorNumber", "dropoffBuildingName",
      "dropoffStreet", "dropoffCity", "dropoffState", "dropoffPincode",
      "packageContents", "packageType", "vehicleType", "serviceType", "pickupAt"
    ];

    const values = mapToDb(body, userId, trackingCode, status, serviceType);
    const placeholders = cols.map(() => "?").join(",");
    const insertSql = `INSERT INTO bookings (${cols.join(", ")}) VALUES (${placeholders})`;

    // Use execute() for better security and connection stability
    const [result] = await db.execute(insertSql, values);

    // Fetch the created booking
    const [rows] = await db.execute(
      `SELECT * FROM bookings WHERE id = ? AND userId = ?`,
      [result.insertId, userId]
    );

    return res.json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error("❌ Create booking error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Server error"
    });
  }
});

// 🔹 GET /api/bookings - Get all user bookings
router.get("/bookings", auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC`,
      [req.user.id]
    );
    return res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error("❌ Fetch bookings error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 GET /api/bookings/:id - Get single booking
router.get("/bookings/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM bookings WHERE id = ? AND userId = ?`,
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    return res.json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error("❌ Fetch booking error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;