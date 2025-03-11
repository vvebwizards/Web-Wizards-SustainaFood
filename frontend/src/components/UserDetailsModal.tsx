import React from "react";

interface User {
  _id: string;
  username: string;
  email: string;
  blocked: boolean;
  role: string;
  lastActive: string;
  profileImage: string;
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onBlock: (userId: string) => void;
}

const BASE_URL = "http://localhost:5000";

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onBlock,
}: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  // Helper to get the full image URL
  const getProfileImageUrl = (profileImage: string) => {
    if (profileImage && profileImage.trim() !== "") {
      return profileImage.startsWith("/")
        ? BASE_URL + profileImage
        : profileImage;
    }
    return "https://via.placeholder.com/64";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <img
              src={getProfileImageUrl(user.profileImage)}
              alt={user.username}
              className="h-16 w-16 rounded-full"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/64";
              }}
            />
            <div className="ml-4">
              <h4 className="text-xl font-medium">{user.username}</h4>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Role</label>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className="font-medium">{user.blocked ? "Blocked" : "Active"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Last Active</label>
              <p className="font-medium">{new Date(user.lastActive).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                onBlock(user._id);
                onClose();
              }}
              className={`px-4 py-2 rounded-lg text-white ${
                !user.blocked
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {!user.blocked ? "Block User" : "Unblock User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
