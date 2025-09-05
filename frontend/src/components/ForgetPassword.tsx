// components/ForgetPassword.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Mail, CheckCircle, XCircle } from "lucide-react";

interface ForgetPasswordProps {
  onBack: () => void;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ onBack }) => {
  const { forgotPassword, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    clearError();

    if (!email) {
      setMessage("Email is required.");
      setMessageType("error");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);

      setMessage("Password reset link has been sent to your email.");
      setMessageType("success");
      setEmail("");
    } catch (err: any) {
      let errorMsg = authError || err.message || "Something went wrong.";

      // Improve user-facing messages
      if (errorMsg.includes("Failed to fetch")) {
        errorMsg = "Unable to connect to server. Please check your internet.";
      } else if (errorMsg.includes("NetworkError")) {
        errorMsg = "Network error. Please try again later.";
      }

      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors"
          aria-label="Go back to login"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 text-sm mt-1">
              Enter your registered email to receive a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                  placeholder="name@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg border flex items-start gap-2 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
                role="alert"
              >
                {messageType === "success" ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p>{message}</p>
                  {messageType === "success" && (
                    <p className="text-xs mt-1 text-green-600">
                      Check your inbox and spam folder. Link expires in 1 hour.
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> For security, we won't confirm if your email is registered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;