import { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import OtpModal from './OtpModal';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const Settings = () => {
  const { user, sendOtp, updateTwoFaStatus, setUser } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twofa);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIs2FAEnabled(user?.twofa || false);
  }, [user]);

  const updateUserStateAndCookies = async () => {
    const response = await axios.get(`http://localhost:5000/api/auth/me`, { withCredentials: true });
    const updatedUser = response.data.user;
    setUser(updatedUser);
    Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
  };

  async function enable2FA() {
    if (is2FAEnabled) {
      const confirmDeactivation = window.confirm('Are you sure you want to deactivate 2FA?');
      if (confirmDeactivation && user?._id) {
        try {
          console.log("Deactivating 2FA for user:", user._id);
          await updateTwoFaStatus(user._id, false, '');
          await updateUserStateAndCookies();
          setIs2FAEnabled(false);
        } catch (error) {
          console.error('Error deactivating 2FA:', error);
          alert('Failed to deactivate 2FA');
        }
      } else {
        console.error("User ID is undefined or deactivation not confirmed");
      }
    } else {
      try {
        setIsOtpModalOpen(true);
        if (user?.id || user?._id) {
          console.log("Sending OTP to user:", user.id || user._id);
          await sendOtp(user.id || user._id);
          await updateUserStateAndCookies();
        } else {
          throw new Error('User ID is undefined');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Failed to send OTP');
      }
    }
  }

  async function handleOtpSubmit(otp: string) {
    if (user?._id) {
      try {
        console.log("Enabling 2FA for user:", user._id);
        await updateTwoFaStatus(user._id, true, otp);
        await updateUserStateAndCookies();
        setIsOtpModalOpen(false);
        setIs2FAEnabled(true);
        setTimeout(() => {
          navigate("/dashboard/profile");
        }, 2000);
      } catch (error) {
        console.error('Error enabling 2FA:', error);
        alert('Failed to enable 2FA');
      }
    } else {
      throw new Error('User ID is undefined');
    }
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
            Notifications Settings
          </h2>
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