import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Menu, Heart, User, History, Settings, Truck, Bell, Building2, LineChart, Gauge, UserCog,
  Package, Calendar, MapPin, Users, Clock, MessageSquare, AlertTriangle, Database, ScrollText
} from "lucide-react";

// A separate mapping for user-friendly role names
const roleNames = {
  admin: "Administrator",
  donor: "Food Donor",
  recipient: "Food Recipient",
  volunteer: "Delivery Volunteer",
};

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
      { to: "/dashboard/overview", icon: Gauge, label: "System Overview" },
      { to: "/dashboard/UsersManagement", icon: UserCog, label: "User Management" },
      { to: "/dashboard/organizations", icon: Building2, label: "Organizations" },
      { to: "/dashboard/donations", icon: Package, label: "Donations" },
      { to: "/dashboard/deliveries", icon: Truck, label: "Deliveries" },
      { to: "/dashboard/reports", icon: LineChart, label: "Analytics" },
      { to: "/dashboard/logs", icon: ScrollText, label: "System Logs" },
      { to: "/dashboard/database", icon: Database, label: "Database" },
      { to: "/dashboard/alerts", icon: AlertTriangle, label: "System Alerts" },
      { to: "/dashboard/settings", icon: Settings, label: "System Settings" },
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
      { to: "/dashboard/profile", icon: User, label: "Profile" },
      { to: "/dashboard/inventory", icon: Package, label: "Inventory" },
      { to: "/dashboard/donations", icon: Heart, label: "My Donations" },
      { to: "/dashboard/schedule", icon: Calendar, label: "Schedule Pickup" },
      { to: "/dashboard/statistics", icon: LineChart, label: "Impact" },
      { to: "/dashboard/history", icon: History, label: "History" },
      { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
      { to: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
  recipient: {
    theme: {
      primary: "blue",
      colors: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        button: "bg-blue-600 hover:bg-blue-700",
        header: "text-blue-600",
      },
      icon: Users,
      name: "Food Recipient",
    },
    navigation: [
      { to: "/dashboard/profile", icon: User, label: "Profile" },
      { to: "/dashboard/available", icon: Package, label: "Available Food" },
      { to: "/dashboard/requests", icon: Heart, label: "My Requests" },
      { to: "/dashboard/location", icon: MapPin, label: "Delivery Location" },
      { to: "/dashboard/statistics", icon: LineChart, label: "Received Items" },
      { to: "/dashboard/history", icon: History, label: "History" },
      { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
      { to: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
  volunteer: {
    theme: {
      primary: "purple",
      colors: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
        button: "bg-purple-600 hover:bg-purple-700",
        header: "text-purple-600",
      },
      icon: Truck,
      name: "Delivery Volunteer",
    },
    navigation: [
      { to: "/dashboard/profile", icon: User, label: "Profile" },
      { to: "/dashboard/deliveries", icon: Truck, label: "Available Deliveries" },
      { to: "/dashboard/schedule", icon: Calendar, label: "My Schedule" },
      { to: "/dashboard/active", icon: Clock, label: "Active Deliveries" },
      { to: "/dashboard/chat", icon: MessageSquare, label: "Communications" },
      { to: "/dashboard/statistics", icon: LineChart, label: "Impact" },
      { to: "/dashboard/history", icon: History, label: "History" },
      { to: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  // Determine the user role and config
  const userRole = user?.role && roleConfigs[user.role] ? user.role : "donor";
  const roleConfig = roleConfigs[userRole];

  // Use roleNames to get a more user-friendly display name
  const displayRoleName = roleNames[userRole] || "Food Donor";

  // Fix Profile Image Not Updating on Login
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedImage = localStorage.getItem("profileImage");

    if (storedUser?.profileImage) {
      const imageUrl = `http://localhost:5000${storedUser.profileImage}?t=${new Date().getTime()}`;
      setProfileImage(imageUrl);
    } else if (storedImage) {
      setProfileImage(storedImage);
    } else {
      setProfileImage("https://via.placeholder.com/40");
    }
  }, [user?.profileImage]);

  // Fix Notifications Not Loading After Refresh
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
    localStorage.removeItem("profileImage");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center z-50">
        {/* LEFT SIDE: Hamburger + Role icon + Role name */}
        <div className="flex items-center space-x-3">
          <button className="p-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            {/* Show the role's icon and name here */}
            <roleConfig.theme.icon
              className={`h-6 w-6 ${roleConfig.theme.colors.header}`}
            />
            <span className="text-xl font-semibold text-gray-900">
              {displayRoleName}
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Notifications, user info, logout */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="h-6 w-6" />
              {notifications.filter((notif) => !notif.isRead).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.filter((notif) => !notif.isRead).length}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <li
                      key={notif._id}
                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                        notif.isRead ? "bg-gray-100" : "bg-white"
                      }`}
                      onClick={() => markAsRead(notif._id)}
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

          <span className="text-gray-900 font-medium">Welcome, {user?.username}</span>
          <img
            src={profileImage}
            alt="Profile"
            className="h-8 w-8 rounded-full border border-gray-300"
          />
          <button
            onClick={handleLogout}
            className={`${roleConfig.theme.colors.button} text-white px-3 py-1 rounded-md text-sm`}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar & Main Content */}
      <div className="flex mt-16">
        <nav
          className={`w-64 bg-white shadow-lg p-5 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          {/* 
            Removed the role name from the sidebar to avoid duplication 
            and keep it only in the header left side. 
          */}
          <ul className="w-full">
            {roleConfig.navigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`flex items-center p-3 rounded-lg ${roleConfig.theme.colors.hover}`}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
