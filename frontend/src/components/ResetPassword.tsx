// ResetPassword.tsx
import React, { useState } from "react";

type ResetPasswordProps = {
  token: string;
  email: string;
  setCurrentView: React.Dispatch<
    React.SetStateAction<
      | "home"
      | "login"
      | "register"
      | "dashboard"
      | "profile"
      | "booking"
      | "confirmation"
      | "track"
      | "recent-bookings"
      | "reset-password"
      | "forgot-password"
    >
  >;
};

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, email, setCurrentView }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const res = await fetch("http://localhost:8000/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Password reset successful. Please log in.");
      setCurrentView("login");
    } else {
      alert(data.message || "❌ Error resetting password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          🔒 Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reset Password
          </button>
        </form>

        <p
          className="text-center text-sm text-gray-600 mt-4 cursor-pointer hover:underline"
          onClick={() => setCurrentView("login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
