import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match!");
      return;
    }
    
    try {
      await resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => navigate("/signin", { state: { message: "Password reset successful!" } }), 2000);
    } catch (err: any) {
      setError("❌ Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
           Change Password
        </h2>
        <p className="text-gray-600 text-center mt-2">
          Enter your new password to reset your account.
        </p>

        {error && (
          <p className="mt-4 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded-lg text-sm text-center">
            {error}
          </p>
        )}

        {success && (
          <div className="mt-4 flex items-center space-x-2 bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircle className="w-6 h-6" />
            <span>Password reset successful! Redirecting...</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-all duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
