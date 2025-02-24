import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Menu, Heart, User, History, Settings, LogOut, Truck, Bell, Building2, LineChart, Gauge,
} from "lucide-react";

const roleConfigs = {
  admin: {
    theme: {
      primary: "red",
      colors: {
        bg: "bg-red-50",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        button: "bg-red-600 hover:bg-red-700",
        header: "text-red-600",
      },
      icon: Building2,
      name: "Admin Dashboard",
    },
    navigation: [
      { to: "/dashboard/overview", icon: <Gauge />, label: "System Overview" },
      { to: "/dashboard/users", icon: <User />, label: "User Management" },
      { to: "/dashboard/reports", icon: <LineChart />, label: "Analytics" },
      { to: "/dashboard/settings", icon: <Settings />, label: "System Settings" },
    ],
  },
  donor: {
    theme: {
      primary: "green",
      colors: {
        bg: "bg-green-50",
        text: "text-green-700",
        hover: "hover:bg-green-100",
        button: "bg-green-600 hover:bg-green-700",
        header: "text-green-600",
      },
      icon: Heart,
      name: "Food Donor",
    },
    navigation: [
      { to: "/dashboard/profile", icon: <User />, label: "Profile" },
      { to: "/dashboard/donations", icon: <Heart />, label: "My Donations" },
      { to: "/dashboard/history", icon: <History />, label: "History" },
    ],
  }
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const userRole = user?.role && roleConfigs[user.role] ? user.role : "donor";
  const roleConfig = roleConfigs[userRole];

  // ✅ Fix Profile Image Not Updating on Login
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedImage = localStorage.getItem("profileImage");
  
    if (storedUser?.profileImage) {
      const imageUrl = `http://localhost:5000${storedUser.profileImage}?t=${new Date().getTime()}`;
      setProfileImage(imageUrl);
    } else if (storedImage) {
      setProfileImage(storedImage);
    } else {
      setProfileImage("https://via.placeholder.com/40"); // Default image
    }
  }, [user?.profileImage]);
  

  // ✅ Fix Notifications Not Loading After Refresh
  useEffect(() => {
    fetchNotifications(); // Always fetch notifications on mount
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
    localStorage.removeItem("profileImage"); // Clear stored image on logout
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center z-50">
        {/* Left Side */}
        <div className="flex items-center space-x-3">
          <button className="p-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            {React.createElement(roleConfig.theme.icon, { className: `h-6 w-6 ${roleConfig.theme.colors.header}` })}
            <span className="text-xl font-semibold text-gray-900">{roleConfig.name}</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="h-6 w-6" />
              {notifications.filter((notif) => !notif.isRead).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
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
                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${notif.isRead ? "bg-gray-100" : "bg-white"}`}
                      onClick={() => markAsRead(notif._id)}
                    >
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <small className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User Info */}
          <span className="text-gray-900 font-medium">Welcome, {user?.username}</span>
          <img src={profileImage} alt="Profile" className="h-8 w-8 rounded-full border border-gray-300" />

          {/* Logout */}
          <button onClick={handleLogout} className={`${roleConfig.theme.colors.button} text-white px-3 py-1 rounded-md text-sm`}>
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar & Content */}
      <div className="flex mt-16">
        <nav className={`w-64 bg-white shadow-lg p-5 flex flex-col transition-all duration-300 ${sidebarOpen ? "block" : "hidden"}`}>
          <ul className="w-full">
            {roleConfig.navigation.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="flex items-center p-3 rounded-lg hover:bg-opacity-80">
                  {item.icon} <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 bg-gray-100 p-6"><Outlet /></main>
      </div>
    </div>
  );
};

export default Layout;
