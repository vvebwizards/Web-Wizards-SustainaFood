import React, { useState, useEffect } from "react";
import { Heart, Truck, Users, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const defaultImage =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  // Function to get the complete image URL
  const getImageUrl = (profileImage: string | undefined) => {
    if (!profileImage) return defaultImage;
    // Check if the profileImage is a full URL
    if (profileImage.startsWith("http")) return profileImage;
    // Otherwise, construct the full URL
    return `http://localhost:5000${profileImage}`;
  };

  const [profileImage, setProfileImage] = useState(
    getImageUrl(user?.profileImage)
  );

  // Update profileImage when the user object changes
  useEffect(() => {
    setProfileImage(getImageUrl(user?.profileImage));
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>

      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <img
            src={profileImage}
            alt="Profile"
            className="h-24 w-24 rounded-full border-2 border-gray-300"
            onError={(e) => {
              // Fallback to default image if the profile image fails to load
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              {user?.username}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <Link
            to={`/dashboard/UpdateProfile/${user?.id}`}
            className="text-blue-600 hover:underline"
          >
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Donations
            </h3>
            <p className="text-2xl font-semibold text-green-600">2,450 lbs</p>
          </div>

          <div className="p-6 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Deliveries
            </h3>
            <p className="text-2xl font-semibold text-green-600">48</p>
          </div>

          <div className="p-6 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              People Helped
            </h3>
            <p className="text-2xl font-semibold text-green-600">1,200+</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">About Me</h3>
          <p className="text-gray-600">
            Passionate about reducing food waste and helping our community.
            Regular contributor to local food banks and community kitchens.
            Committed to making a difference through food rescue and
            redistribution efforts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
