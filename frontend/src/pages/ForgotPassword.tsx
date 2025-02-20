import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="sm:w-full sm:max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Forgot Password</h2>
        {success ? (
          <div className="bg-green-100 text-green-600 px-4 py-2 rounded-lg mt-4">
            <CheckCircle className="w-5 h-5 mr-2 inline" />
            Reset password email sent successfully.
          </div>
        ) : (
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Send Reset Email
            </button>
          </form>
        )}
        <Link to="/signin" className="mt-4 text-sm text-green-600 hover:text-green-500">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;


