import { useSearchParams, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Account Confirmation</h2>
        <p className="mt-2 text-gray-600">
          An email with your account confirmation link has been sent to: <br />
          <span className="font-bold">{email}</span>
        </p>
        <p className="mt-2 text-gray-500">Check your email and come back to proceed.</p>

       
      </div>
    </div>
  );
}

export default VerifyEmail;
