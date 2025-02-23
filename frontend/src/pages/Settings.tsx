import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import OtpModal from './OtpModal';

const Settings = () => {
  const { user, updatePhoneNumber, sendOtp } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  async function enable2FA() {
    try {
      setIsOtpModalOpen(true);
      if (user?.id) {
        await sendOtp(user.id);
      } else {
        throw new Error('User ID is undefined');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP');
    }
  }

  function handleEditPhone() {
    setIsEditingPhone(true);
  }

  async function handleSavePhone() {
    if (user) {
      try {
        await updatePhoneNumber(user.id, phoneNumber);
        setIsEditingPhone(false);
        alert('Phone number updated');
      } catch (error) {
        console.error('Error updating phone number:', error);
        alert('Failed to update phone number');
      }
    }
  }

  async function handleOtpSubmit(otp: string) {
    console.log('OTP submitted:', otp);
    setIsOtpModalOpen(false);
    setIs2FAEnabled(true);
    alert('2FA enabled');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Security Features
          </h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={is2FAEnabled}
                onChange={enable2FA}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm text-gray-700">
                Two Factor Authentication (2FA)
              </label>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <p>(+216)</p>
              <input
                type="tel"
                disabled={!isEditingPhone}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 ml-2"
              />
              <button
                onClick={isEditingPhone ? handleSavePhone : handleEditPhone}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                {isEditingPhone ? 'Save' : 'Edit'}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternative Email
              </label>
              <input
                type="email"
                className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="alternative@example.com"
              />
            </div>
          </div>
        </div>
      </div>
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
      />
    </div>
  );
};

export default Settings;