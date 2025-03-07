import React, { useState } from 'react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Enter OTP</h2>
        <p className="mb-4">Please check your email inbox and enter the verification code.</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 mb-4"
          placeholder="Enter OTP"
        />
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-600 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(otp)}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;