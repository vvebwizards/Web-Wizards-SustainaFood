import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  User,
  History,
  Settings,
  LogOut,
  Truck,
  Bell,
  FileText,
  BarChart,
} from "lucide-react";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const [profileImage, setProfileImage] = useState(
    user?.profileImage
      ? `http://localhost:5000${user.profileImage}`
      : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  );

  // Update profileImage when the user object changes
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(`http://localhost:5000${user.profileImage}`);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-green-600" />
            <span className="text-xl font-semibold text-gray-900">
              Food Rescue
            </span>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-900 font-medium">
                  Welcome, {user.username}
                </span>
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/signin"
                className="text-green-600 font-medium hover:underline"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 space-y-1">
            {[
              { to: "/dashboard/profile", icon: <User />, label: "Profile" },
              {
                to: "/dashboard/donations",
                icon: <Heart />,
                label: "My Donations",
              },
              {
                to: "/dashboard/make-donation",
                icon: <Truck />,
                label: "Make Donation",
              },
              {
                to: "/dashboard/notifications",
                icon: <Bell />,
                label: "Notifications",
              },
              {
                to: "/dashboard/activity-logs",
                icon: <FileText />,
                label: "Activity Logs",
              },
              {
                to: "/dashboard/statistics",
                icon: <BarChart />,
                label: "Statistics",
              },
              { to: "/dashboard/history", icon: <History />, label: "History" },
              {
                to: "/dashboard/settings",
                icon: <Settings />,
                label: "Settings",
              },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
