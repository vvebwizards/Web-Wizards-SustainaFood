import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
const UpdateProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserInfo } = useAuth(); // Destructure updateUserInfo from useAuth

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setProfileImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateUserInfo(
        userId,
        formData.username,
        formData.email,
        formData.password
      ); // Call updateUserInfo
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard/profile");
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 3 }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Update Profile
        </h1>

        <div className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex items-center space-x-6">
            <img
              src={profileImage}
              alt="Profile"
              className="h-24 w-24 rounded-full border-2 border-gray-300"
            />
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                Update Your Profile
              </h2>
              <p className="text-gray-500">Make changes to your account.</p>
            </div>
          </div>

          {/* Upload Profile Photo Section */}
          <div className="flex items-center mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="profile-photo-input"
            />
            <label
              htmlFor="profile-photo-input"
              className="cursor-pointer flex items-center bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              <Camera className="mr-2 h-5 w-5" />
              Upload Profile Photo
            </label>
          </div>

          {/* Update Profile Form */}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default UpdateProfile;
