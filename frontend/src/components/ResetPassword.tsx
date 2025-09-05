// components/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 🔍 Verify token validity on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await apiService.verifyResetToken(token, email);
        // Token is valid — proceed
      } catch (err: any) {
        setError("Invalid or expired reset link. Please request a new one.");
      }
    };

    if (!token || !email) {
      setError("Missing reset information. Please use the link from your email.");
    } else {
      verifyToken();
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 🔐 Password Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must include uppercase, lowercase, and a number.");
      setLoading(false);
      return;
    }

    try {
      await apiService.resetPassword(token, email, password);
      setSuccess(true);

      // Navigate after feedback
      setTimeout(() => {
        setCurrentView("login");
      }, 2000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(
        err.message.includes("Failed to fetch")
          ? "Unable to connect to server. Please check your internet connection."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">🔐 Reset Your Password</h2>

        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6" aria-live="polite">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
              <title>Password reset successful</title>
<path
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="2"
  d="M5 13l4 4L19 7"
  aria-hidden="true"
/>
              </svg>
            </div>
            <p className="text-green-600 font-medium">Password reset successful!</p>
            <p className="text-gray-600 text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-gray-700 text-sm mb-1">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100"
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-gray-700 text-sm mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <p
          className="text-center text-sm text-gray-600 mt-4 cursor-pointer hover:underline hover:text-red-600 transition"
          onClick={() => setCurrentView("login")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setCurrentView("login");
            }
          }}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;