import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Camera, X, Save, Key, User, Mail, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserId } from "../utils/chatHelpers";
import { useSettings } from "../context/SettingsContext";
import axios from "axios";
import OtpModal from './OtpModal';
import Cookies from "js-cookie";

const roleConfigs = {
  admin: {
    theme: {
      primary: "red",
      colors: {
        bg: "bg-red-50",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        button: "bg-red-600 hover:bg-red-700",
      },
    },
  },
  donor: {
    theme: {
      primary: "green",
      colors: {
        bg: "bg-green-50",
        text: "text-green-700",
        hover: "hover:bg-green-100",
        button: "bg-green-600 hover:bg-green-700",
      },
    },
  },
  recipient: {
    theme: {
      primary: "blue",
      colors: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        button: "bg-blue-600 hover:bg-blue-700",
      },
    },
  },
  volunteer: {
    theme: {
      primary: "purple",
      colors: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
        button: "bg-purple-600 hover:bg-purple-700",
      },
    },
  },
};

const UpdateProfile = () => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserInfo, updatePassword, sendOtp, updateTwoFaStatus, setUser } = useAuth();
  
  const userId = paramUserId || getUserId(user);
  const theme = roleConfigs[user?.role as keyof typeof roleConfigs]?.theme || roleConfigs.donor.theme;

  const [formData, setFormData] = useState({ username: "" });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const { settings, updateSettings } = useSettings();
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twofa);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [notificationTime, setNotificationTime] = useState('00:00');
  const [daysBeforeExpiration, setDaysBeforeExpiration] = useState('1');
  const [isChanged, setIsChanged] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const defaultImage = 'https://via.placeholder.com/150';

  const toggleSettings = () => setShowSettings(prev => !prev);

  useEffect(() => {
    setIs2FAEnabled(user?.twofa || false);
  }, [user]);

  useEffect(() => {
    if (Array.isArray(settings) && settings.length > 0) {
      const setting = settings[0];
  
      const hour = setting?.expiredNotifHour?.toString().padStart(2, '0') || '00';
      const minute = setting?.expiredNotifMinute?.toString().padStart(2, '0') || '00';
  
      setNotificationTime(`${hour}:${minute}`);
      setDaysBeforeExpiration(setting?.expiredNotifDate?.toString() || '1');
    }
  }, [settings]);

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

  const handleNotificationTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationTime(event.target.value);
    setIsChanged(true);
  };

  const handleDaysBeforeExpirationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDaysBeforeExpiration(event.target.value);
    setIsChanged(true);
  };

  const handleSave = async () => {
    const [hour, minute] = notificationTime.split(":").map(Number);
  
    try {
      await updateSettings({
        expiredNotifHour: hour,
        expiredNotifMinute: minute,
        expiredNotifDate: Number(daysBeforeExpiration),
      });
      console.log("✅ Settings updated successfully!");
      setIsChanged(false);
    } catch (error) {
      console.error("❌ Failed to update settings:", error);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username || "" });
    }
  }, [user]);

  useEffect(() => {
    if (!profileImage) {
      if (user?.profileImage) {
        const isAbsolute = user.profileImage.startsWith("http");
        const imageUrl = isAbsolute
          ? user.profileImage
          : `http://localhost:5000${user.profileImage}`;
        setPreview(`${imageUrl}?t=${Date.now()}`);
      } else {
        setPreview(defaultImage);
      }
      return;
    }
    const objectUrl = URL.createObjectURL(profileImage);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!userId) {
      setProfileError("User ID is missing.");
      return;
    }
    if (!formData.username.trim()) {
      setProfileError("Username is required.");
      return;
    }

    try {
      setLoading(true);
      await updateUserInfo(userId, formData.username, profileImage);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard/Profile");
      }, 2000);
    } catch (err: any) {
      console.error("Error in updateUserInfo:", err);
      setProfileError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!userId) {
      setPasswordError("User ID is missing.");
      return;
    }
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    try {
      setPasswordLoading(true);
      await updatePassword(userId, passwordData.oldPassword, passwordData.newPassword);
      setPasswordSuccess("Password updated successfully!");
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className={`min-h-screen ${theme.colors.bg} flex items-center justify-center`}>
        <p className="text-red-500">Invalid user ID.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen ${theme.colors.bg} py-8 px-4`}
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/dashboard/Profile")}
          className={`mb-6 flex items-center gap-2 ${theme.colors.text} hover:opacity-80 transition-opacity`}
        >
          <ArrowLeft size={20} />
          <span>Back to Profile</span>
        </button>

        <div className={`bg-white rounded-2xl shadow-xl p-8 border border-${theme.primary}-200`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-full ${theme.colors.bg}`}>
              <User size={24} className={theme.colors.text} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className={`w-40 h-40 rounded-full overflow-hidden border-4 border-${theme.primary}-400 transition-transform duration-300 group-hover:scale-105`}>
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultImage;
                      }}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-photo-input"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="profile-photo-input"
                    className={`absolute bottom-2 right-2 ${theme.colors.button} p-3 rounded-full text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-110`}
                  >
                    <Camera size={20} />
                  </label>
                </div>
                <p className={`text-lg font-medium ${theme.colors.text}`}>
                  {user?.username || "Loading..."}
                </p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail size={20} className={theme.colors.text} />
                  <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent transition-all duration-200`}
                    />
                  </div>

                  {(profileSuccess || profileError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg ${
                        profileSuccess ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                      }`}
                    >
                      {profileSuccess || profileError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all duration-200 ${
                      loading ? `bg-${theme.primary}-400 cursor-not-allowed` : `${theme.colors.button} hover:shadow-lg transform hover:-translate-y-0.5`
                    }`}
                  >
                    <Save size={20} />
                    {loading ? "Updating..." : "Save Changes"}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Key size={20} className={theme.colors.text} />
                  <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                    </div>
                    <button
                      onClick={() => setPasswordModalOpen(true)}
                      className={`px-4 py-2 rounded-lg ${theme.colors.button} text-white shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5`}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div>
              <button
                onClick={toggleSettings}
                className={`${theme.colors.button} px-6 py-2 rounded-md text-white mb-4`}
              >
                Settings
              </button>

              {showSettings && (
                <div>
                  <button className={`${theme.colors.button} px-6 py-1 rounded-md text-white`}>
                    Reset to Default
                  </button>

                  <div className="space-y-6 mt-5">
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
                        Notifications
                      </h2>
                      <div className="ml-6 space-y-4">
                        <h3 className="text-md font-medium text-gray-800 mb-2">
                          Food Expiration Notifications
                        </h3>

                        <div className="flex items-center space-x-16">
                          <label className="text-gray-700 text-sm">
                            Notification Time:
                          </label>
                          <input
                            type="time"
                            className="border border-gray-300 rounded p-1"
                            value={notificationTime}
                            onChange={handleNotificationTimeChange}
                          />
                        </div>

                        <div className="flex items-center space-x-16">
                          <label className="text-gray-700 text-sm">
                            Days Before Expiration:
                          </label>
                          <select
                            className="border border-gray-300 rounded p-1"
                            value={daysBeforeExpiration}
                            onChange={handleDaysBeforeExpirationChange}
                          >
                            {[...Array(7)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} day{i > 0 && 's'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isChanged && (
        <div className="mt-6 justify-center items-center flex gap-5">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-1 rounded-md"
          >
            Save
          </button>
          <button
            onClick={handleSave}
            className="bg-gray-800 text-white px-6 py-1 rounded-md"
          >
            Discard Changes
          </button>
        </div>
      )}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
      />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-2xl p-6 max-w-md w-full border border-${theme.primary}-200 shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Key size={20} className={theme.colors.text} />
                  <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                </div>
                <button
                  onClick={() => setPasswordModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent`}
                  />
                </div>

                {(passwordSuccess || passwordError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      passwordSuccess ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                  >
                    {passwordSuccess || passwordError}
                  </motion.div>
                )}

                <button
                  onClick={handlePasswordSubmit}
                  disabled={passwordLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all duration-200 ${
                    passwordLoading
                      ? `bg-${theme.primary}-400 cursor-not-allowed`
                      : `${theme.colors.button} hover:shadow-lg transform hover:-translate-y-0.5`
                  }`}
                >
                  <Save size={20} />
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UpdateProfile;