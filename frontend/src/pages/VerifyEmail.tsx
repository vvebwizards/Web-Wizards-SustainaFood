import React from "react";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
  const navigate = useNavigate();

  // Automatically redirect to sign in after 2 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/signin");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Account Created</h2>
        <p className="mt-2 text-gray-600">
          Your account has been created successfully and is ready to use.
        </p>
        <p className="mt-2 text-gray-500">You can now log in directly.</p>

       
      </div>
    </div>
  );
}

export default VerifyEmail;
