import React, { useState, useEffect } from "react";
import { Heart, Truck, Users, Edit2, Twitter, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultProfileImage from "../assets/images/default_user_img.jpg";

const Profile = () => {
  const { user } = useAuth();
  
  // Default profile image
  const defaultImage = defaultProfileImage ;

  // Function to get the correct image URL
  const getImageUrl = (profileImage: string | undefined) => {
    if (!profileImage) return defaultImage;
    if (profileImage.startsWith("http")) return profileImage;
    return `http://localhost:5000${profileImage}?t=${new Date().getTime()}`; // Prevent caching issues
  };

  // Profile image state
  const [profileImageUrl, setProfileImageUrl] = useState(getImageUrl(user?.profileImage));

  // Fix Profile Image Not Updating on Login
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImageUrl(getImageUrl(user.profileImage));
    }
  }, [user?.profileImage]);

  // Dummy recent activity data
  const recentActivity = [
    { id: 1, text: "Donated 50 lbs of produce on April 1, 2023" },
    { id: 2, text: "Delivered a donation on March 25, 2023" },
    { id: 3, text: "Helped 3 people on March 20, 2023" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">Profile</h1>

      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div>
          <img
            key={profileImageUrl}
            src={profileImageUrl}
            alt="Profile"
            className="h-24 w-24 rounded-full border-2 border-gray-300 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
        </div>
        {/* User Info */}
        <div>
          <h2 className="text-2xl font-medium text-gray-900">{user?.username}</h2>
          <p className="text-gray-500">{user?.email}</p>
          {/* Iconized Edit Profile Link */}
          <div className="mt-2">
            <Link
              to={`/dashboard/UpdateProfile/${user?.id}`}
              className="flex items-center text-blue-600 hover:underline"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-green-50 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Donations</h3>
          <p className="text-2xl font-semibold text-green-600">2,450 lbs</p>
        </div>

        <div className="p-6 bg-green-50 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Deliveries</h3>
          <p className="text-2xl font-semibold text-green-600">48</p>
        </div>

        <div className="p-6 bg-green-50 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">People Helped</h3>
          <p className="text-2xl font-semibold text-green-600">1,200+</p>
        </div>
      </div>

      {/* About Me Section */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-xl font-medium text-gray-900 mb-4">About Me</h3>
        <p className="text-gray-600 leading-relaxed">
          Passionate about reducing food waste and helping our community.
          Regular contributor to local food banks and community kitchens.
          Committed to making a difference through food rescue and redistribution efforts.
        </p>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Recent Activity</h3>
        <ul className="space-y-4">
          {recentActivity.map((activity) => (
            <li key={activity.id} className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
              <p className="text-gray-600">{activity.text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Section: Additional User Info & Social Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Additional User Information */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-3">
            <p className="text-gray-600">
              <span className="font-medium">Location:</span>{" "}
              {user?.location || "Not provided"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Phone:</span>{" "}
              {user?.phone || "Not provided"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Member since:</span>{" "}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Address:</span>{" "}
              {user?.address || "Not provided"}
            </p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Social Media</h3>
          <div className="flex items-center space-x-4">
            <a
              href={user?.twitter || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href={user?.instagram || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-700"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href={user?.facebook || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-800 hover:text-blue-900"
            >
              <Facebook className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
