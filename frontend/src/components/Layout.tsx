import React, { useState, useEffect } from "react"; // Add useEffect
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext"; // Import the notification context
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // State for dropdown visibility
  const { notifications, fetchNotifications, markAsRead } = useNotifications(); // Add fetchNotifications
  

  // Fetch notifications when the user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications(); // Fetch notifications for the logged-in user
    }
  }, [user, fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen); // Toggle dropdown visibility
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-green-600" />
            <span className="text-xl font-semibold text-gray-900">Food Rescue</span>
          </div>

          {/* User Info, Notifications, and Logout */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications Bell Icon */}
                <div className="relative">
                  <button
                    onClick={toggleNotifications} // Toggle dropdown on click
                    className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <Bell className="h-6 w-6" />
                    {/* Add a badge for unread notifications */}
                    {notifications.filter((notif) => !notif.isRead).length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {notifications.filter((notif) => !notif.isRead).length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <ul className="max-h-60 overflow-y-auto">
                        {notifications.map((notif) => (
                          <li
                            key={notif._id}
                            className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                              notif.isRead ? "bg-gray-100" : "bg-white"
                            }`}
                            onClick={() => markAsRead(notif._id)} // Mark as read on click
                          >
                            <p className="text-sm text-gray-700">{notif.message}</p>
                            <small className="text-xs text-gray-500">
                              {new Date(notif.createdAt).toLocaleString()}
                            </small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Username and Profile Picture */}
                <span className="text-gray-900 font-medium">Welcome, {user.username}</span>
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />

                {/* Logout Button */}
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
              { to: "/dashboard/donations", icon: <Heart />, label: "My Donations" },
              { to: "/dashboard/make-donation", icon: <Truck />, label: "Make Donation" },
              { to: "/dashboard/activity-logs", icon: <FileText />, label: "Activity Logs" },
              { to: "/dashboard/statistics", icon: <BarChart />, label: "Statistics" },
              { to: "/dashboard/history", icon: <History />, label: "History" },
              { to: "/dashboard/settings", icon: <Settings />, label: "Settings" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"
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