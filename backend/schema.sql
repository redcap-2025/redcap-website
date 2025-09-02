-- Create database (run this only once if DB doesn't exist)
CREATE DATABASE IF NOT EXISTS redcap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE redcap_db;

-- Users table
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
  resetToken VARCHAR(255) NULL,
  resetTokenExpiration datetime null
);

-- Bookings table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  trackingCode VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  pickupName VARCHAR(100),
  pickupPhone VARCHAR(20),
  pickupDoorNumber VARCHAR(50),
  pickupBuildingName VARCHAR(100),
  pickupStreet VARCHAR(100),
  pickupCity VARCHAR(100),
  pickupState VARCHAR(100),
  pickupPincode VARCHAR(20),
  dropoffName VARCHAR(100),
  dropoffPhone VARCHAR(20),
  dropoffDoorNumber VARCHAR(50),
  dropoffBuildingName VARCHAR(100),
  dropoffStreet VARCHAR(100),
  dropoffCity VARCHAR(100),
  dropoffState VARCHAR(100),
  dropoffPincode VARCHAR(20),
  packageContents TEXT,
  packageType VARCHAR(100),
  vehicleType VARCHAR(50),
  serviceType VARCHAR(50),
  pickupAt DATETIME,
  deliverystatus varchar(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
