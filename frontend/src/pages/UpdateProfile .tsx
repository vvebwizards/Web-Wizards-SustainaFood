import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import defaultProfileImage from "../assets/images/default_user_img.jpg";

const UpdateProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserInfo } = useAuth();

  // Initialize form data with empty strings so inputs are controlled.
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const defaultImage =
    "";

 
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateUserInfo(
        userId!,
        formData.username,
        formData.email,
        formData.password,
        profileImage!
      );
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard/profile");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter new email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default UpdateProfile;
