-- 1. Create the database (run only once)
-- Note: On Railway, you usually can't USE a custom DB unless configured
-- This may be skipped if using default `railway` database
CREATE DATABASE IF NOT EXISTS redcap_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Remove or comment out USE if not supported (common on Railway)
-- USE redcap_db;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  doorNumber VARCHAR(50),
  buildingName VARCHAR(100),
  street VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resetToken VARCHAR(255),
  resetTokenExpiration DATETIME,
  INDEX idx_users_email (email)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  trackingCode VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  
  -- Pickup Info
  pickupName VARCHAR(100),
  pickupPhone VARCHAR(20),
  pickupDoorNumber VARCHAR(50),
  pickupBuildingName VARCHAR(100),
  pickupStreet VARCHAR(100),
  pickupCity VARCHAR(100),
  pickupState VARCHAR(100),
  pickupPincode VARCHAR(20),

  -- Dropoff Info
  dropoffName VARCHAR(100),
  dropoffPhone VARCHAR(20),
  dropoffDoorNumber VARCHAR(50),
  dropoffBuildingName VARCHAR(100),
  dropoffStreet VARCHAR(100),
  dropoffCity VARCHAR(100),
  dropoffState VARCHAR(100),
  dropoffPincode VARCHAR(20),

  -- Package Info
  packageContents TEXT,
  packageType VARCHAR(100),
  vehicleType VARCHAR(50),
  serviceType VARCHAR(50),

  pickupAt DATETIME,
  deliverystatus VARCHAR(100) DEFAULT 'Not Assigned',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_userId ON bookings(userId);
CREATE INDEX IF NOT EXISTS idx_bookings_trackingCode ON bookings(trackingCode);

-- ✅ All done! No sample data inserted.