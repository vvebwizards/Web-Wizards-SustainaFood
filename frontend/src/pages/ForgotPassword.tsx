import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error sending reset email:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
           Forgot Password
        </h2>
        <p className="text-gray-600 text-center mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {success ? (
          <div className="mt-6 flex items-center space-x-2 bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircle className="w-6 h-6" />
            <span>A reset link has been sent to your email.</span>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-all duration-200"
            >
              Send Reset Email
            </button>
          </form>
        )}

        <div className=" mt-4">
          <Link to="/signin" className="text-green-600 hover:text-green-500 font-medium">
             Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
