
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setStatus("Invalid verification link.");
      return;
    }

    axios
    .get(`http://localhost:5000/api/auth/verify-email?token=${token}`)
    .then(() => {
        setStatus("Email has been verified! You can now log in.");
        setTimeout(() => navigate("/signin"), 3000);
      })
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 text-white">
      <div className="bg-white text-green-700 shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold">{status}</h2>
        {status === "Email has been verified! You can now log in." && (
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        )}
      </div>
    </div>
  );
}

export default ConfirmEmail;
