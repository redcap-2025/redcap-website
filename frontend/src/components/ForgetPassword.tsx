import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Mail, CheckCircle, XCircle } from "lucide-react";

interface ForgetPasswordProps {
  onBack: () => void;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ onBack }) => {
  const { forgotPassword, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  clearError();
  setMessage("");
  setMessageType("");
  setLoading(true);

  try {
    await forgotPassword(email);
    setMessage("✅ Password reset link has been sent to your email.");
    setMessageType("success");
  } catch (err: any) {
    let errorMsg = err?.message || "❌ Failed to send reset link. Please try again.";

    // 🔀 Handle invalid email specifically
    if (
      errorMsg.toLowerCase().includes("not found") ||
      errorMsg.toLowerCase().includes("invalid") ||
      errorMsg.toLowerCase().includes("no user")
    ) {
      errorMsg = "❌ This email is not registered with us.";
    }

    setMessage(errorMsg);
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 text-sm mt-1">
              Enter your registered email address to receive a reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg border ${
                messageType === "success" 
                  ? "bg-green-50 border-green-200 text-green-700" 
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <div className="flex items-center gap-2">
                  {messageType === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <p className="text-sm">{message}</p>
                </div>
                {messageType === "success" && (
                  <p className="text-xs mt-2 text-green-600">
                    Check your inbox and spam folder. The link will expire in 1 hour.
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Additional info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> For security reasons, we'll only send an email if this address is registered in our system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;