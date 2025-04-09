import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Camera, X } from "lucide-react"; // Added X icon
import { motion } from "framer-motion";
import defaultProfileImage from "../assets/images/default_user_img.jpg";
import Modal from "../components/Modal";

const UpdateProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserInfo, updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(""); // Separate success for profile
  const [passwordSuccess, setPasswordSuccess] = useState(""); // Separate success for password
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const defaultImage = "";

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
      });
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
        setPreview(defaultProfileImage);
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
    setError("");
    setProfileSuccess("");

    try {
      await updateUserInfo(userId!, formData.username, profileImage!);
      setProfileSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  const handlePasswordSubmit = async () => {
    setError("");
    setPasswordSuccess("");

    // Check for empty inputs
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setError("All fields are required.");
      return;
    }

    // Check if new password matches confirm password
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    // Check if current password matches new password
    if (passwordData.oldPassword === passwordData.newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    try {
      await updatePassword(userId!, passwordData.oldPassword, passwordData.newPassword);
      setPasswordSuccess("Password updated successfully!");
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      }, 2000); // Close modal after 2 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Update Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full rounded-full border-2 border-gray-300 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImage;
                }}
              />
              <input
                type="file"
                accept="image/*"
                id="profile-photo-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="profile-photo-input"
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-700 cursor-pointer transition-colors"
                title="Upload Profile Photo"
              >
                <Camera className="h-5 w-5" />
              </label>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-800">{user?.username}</p>
          </div>

          {/* Right Column: User Info and Password */}
          <div className="space-y-6">
            {/* User Info Update Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🧑‍💼 User Info Update
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter new username"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                >
                  Update Profile
                </button>
                {profileSuccess && (
                  <p className="text-green-500 text-sm mt-2">{profileSuccess}</p>
                )}
                {error && !isPasswordModalOpen && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </form>
            </div>

            {/* Update Password Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🔒 Update Password
              </h2>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <input
                type="password"
                value="••••••••"
                disabled
                className="w-full px-3 py-2 border rounded-md bg-gray-100 mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <Modal onClose={() => setPasswordModalOpen(false)}>
          <div className="relative">
            <h2 className="text-lg font-semibold text-gray-800">🔒 Change Password</h2>
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <input
            type="password"
            name="oldPassword"
            placeholder="Current Password"
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border rounded-md mt-4"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border rounded-md mt-2"
          />
          <input
            type="password"
            name="confirmNewPassword"
            placeholder="Confirm New Password"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border rounded-md mt-2"
          />
          {error && isPasswordModalOpen && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          {passwordSuccess && (
            <p className="text-green-500 text-sm mt-2">{passwordSuccess}</p>
          )}
          <button
            onClick={handlePasswordSubmit}
            className="w-full py-2 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </Modal>
      )}
    </motion.div>
  );
};

export default UpdateProfile;