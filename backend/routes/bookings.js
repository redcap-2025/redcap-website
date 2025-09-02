// backend/routes/bookings.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

/** Helper: tracking code */
function makeTrackingCode() {
  const rand = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(5, "0");
  return `RC${Date.now().toString(36).toUpperCase()}${rand}`;
}

/** Coerce empty strings to null so they store cleanly */
const nn = (v) => (v === "" || v === undefined ? null : v);

/** Minimal body validation */
function requireFields(obj, fields) {
  return fields.filter((f) => !obj[f] && obj[f] !== 0 && obj[f] !== false);
}

/** 🔀 Transform frontend fields → DB schema fields */
function mapToDb(body, userId, trackingCode, status, serviceType) {
  return [
    userId,
    trackingCode,
    status,

    nn(body.senderName),                // pickupName
    nn(body.senderPhone),               // pickupPhone
    nn(body.pickupDoorNumber),
    nn(body.pickupBuildingName),
    nn(body.pickupStreet),
    nn(body.pickupCity),
    nn(body.pickupState),
    nn(body.pickupPincode),

    nn(body.receiverName),              // dropoffName
    nn(body.receiverPhone),             // dropoffPhone
    nn(body.deliveryDoorNumber),
    nn(body.deliveryBuildingName),
    nn(body.deliveryStreet),
    nn(body.deliveryCity),
    nn(body.deliveryState),
    nn(body.deliveryPincode),

    nn(body.description),               // packageContents
    nn(body.packageType),
    nn(body.vehicleType),
    serviceType,
    nn(body.pickupDate),                // pickupAt
  ];
}

/**
 * POST /api/bookings
 * Create a booking
 */
router.post("/bookings", auth, async (req, res) => {
  try {
    const body = req.body || {};
    const userId = req.user.id;

    // Required frontend fields
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
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const trackingCode = makeTrackingCode();
    const status = "Pending"; // default
    const serviceType = nn(body.serviceType);

    // DB columns
    const cols = [
      "userId",
      "trackingCode",
      "status",

      "pickupName",
      "pickupPhone",
      "pickupDoorNumber",
      "pickupBuildingName",
      "pickupStreet",
      "pickupCity",
      "pickupState",
      "pickupPincode",

      "dropoffName",
      "dropoffPhone",
      "dropoffDoorNumber",
      "dropoffBuildingName",
      "dropoffStreet",
      "dropoffCity",
      "dropoffState",
      "dropoffPincode",

      "packageContents",
      "packageType",
      "vehicleType",
      "serviceType",
      "pickupAt",
    ];

    const values = mapToDb(body, userId, trackingCode, status, serviceType);
    const placeholders = cols.map(() => "?").join(",");
    const insertSql = `INSERT INTO bookings (${cols.join(",")}) VALUES (${placeholders})`;

    // Insert booking
    const [result] = await db.query(insertSql, values);

    // Fetch inserted row
    const [rows] = await db.query(
      `SELECT * FROM bookings WHERE id = ? AND userId = ?`,
      [result.insertId, userId]
    );

    return res.json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error("❌ Create booking error:", err);
    return res.status(500).json({
      success: false,
      message: err?.sqlMessage || err?.message || "Server error",
    });
  }
});

/**
 * GET /api/bookings
 * Get all bookings for user
 */
router.get("/bookings", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC`,
      [req.user.id]
    );
    res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error("❌ Fetch bookings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/bookings/:id
 * Get one booking by ID
 */
router.get("/bookings/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM bookings WHERE id = ? AND userId = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error("❌ Fetch booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
