import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useCart } from "../context/CartContext";
import {
  Menu,
  Bell,
  ShoppingCart,
  Building2,
  UserCog,
  Package,
  Truck,
  LineChart,
  ScrollText,
  Database,
  AlertTriangle,
  User,
  Heart,
  Calendar,
  MapPin,
  History,
  Settings,
  Users,
  Clock,
  MessageSquare,
  Gauge,
  Gamepad2,
  Gift,
} from "lucide-react";
import defaultProfileImage from "../assets/images/default_user_img.jpg";

const roleNames: Record<string, string> = {
  admin: "Administrator",
  donor: "Food Donor",
  recipient: "Food Recipient",
  volunteer: "Delivery Volunteer",
};

const roleConfigs: Record<string, any> = {
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
      {
        to: "/dashboard/UsersManagement",
        icon: UserCog,
        label: "User Management",
      },
      {
        to: "/dashboard/organizations",
        icon: Building2,
        label: "Organizations",
      },
      { to: "/dashboard/donations", icon: Package, label: "Donations" },
      { to: "/dashboard/deliveries", icon: Truck, label: "Deliveries" },
      { to: "/dashboard/reports", icon: LineChart, label: "Analytics" },
      { to: "/dashboard/logs", icon: ScrollText, label: "System Logs" },
      { to: "/dashboard/database", icon: Database, label: "Database" },
      {
        to: "/dashboard/notifications",
        icon: AlertTriangle,
        label: "System Alerts",
      },
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
      { to: "/dashboard/my-requests", icon: Heart, label: "My Requests" },
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
      { to: "/dashboard/orders", icon: Package, label: "Orders" },
      {
        to: "/dashboard/deliveries",
        icon: Truck,
        label: "Deliveries",
      },
      { to: "/dashboard/schedule", icon: Calendar, label: "My Schedule" },
      { to: "/dashboard/active", icon: Clock, label: "Active Deliveries" },
      { to: "/dashboard/chat", icon: MessageSquare, label: "Communications" },
      { to: "/dashboard/statistics", icon: LineChart, label: "Impact" },
      { to: "/dashboard/history", icon: History, label: "History" },
      { to: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
};

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAsRead } = useNotifications();
  const { cartItems } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);

  const userRole = user?.role ?? "donor";
  const roleConfig = roleConfigs[userRole];

  if (!roleConfig) {
    return (
      <div className="p-6 text-red-600">
        ❌ Unknown user role: <strong>{userRole}</strong>. Please check your
        role configuration.
      </div>
    );
  }

  const displayRoleName = roleNames[userRole] || "User";

  useEffect(() => {
    if (user?.profileImage) {
      const imageUrl = user.profileImage.startsWith("http")
        ? user.profileImage
        : `http://localhost:5000${user.profileImage}`;
      setProfileImage(`${imageUrl}?t=${Date.now()}`);
    } else {
      setProfileImage(defaultProfileImage);
    }
  }, [user]);

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
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center z-50">
        <div className="flex items-center space-x-3">
          <button className="p-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <roleConfig.theme.icon
              className={`h-6 w-6 ${roleConfig.theme.colors.header}`}
            />
            <span className="text-xl font-semibold text-gray-900">
              {displayRoleName}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Prize Wheel Icon (All roles or specific roles) */}
          <NavLink
            to="/dashboard/**"
            className="flex items-center space-x-1 p-2 text-gray-600 hover:text-gray-900"
            title="Prize Wheel"
          >
            <span
              className={`font-semibold text-sm ${roleConfig.theme.colors.text}`}
            >
              {user?.points ?? 0} pts
            </span>
            <Gift className="h-6 w-6" />
          </NavLink>

          {/* Game Center Icon (All roles or specific roles) */}
          <NavLink
            to="/dashboard/game-center"
            className="relative p-2 text-gray-600 hover:text-gray-900"
            title="Game Center"
          >
            <Gamepad2 className="h-6 w-6" />
          </NavLink>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="h-6 w-6" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <li
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                        notif.isRead ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      <p className="text-sm text-gray-700">{notif.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Cart Icon (Recipients Only) */}
          {userRole === "recipient" && (
            <NavLink
              to="/dashboard/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </NavLink>
          )}

          <span className="text-gray-900 font-medium">
            Welcome, {user?.username}
          </span>
          <img
            src={profileImage}
            alt="Profile"
            className="h-8 w-8 rounded-full border"
            onError={(e) => {
              e.currentTarget.src = defaultProfileImage;
            }}
          />
          <button
            onClick={handleLogout}
            className={`${roleConfig.theme.colors.button} text-white px-3 py-1 rounded-md text-sm`}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex mt-16">
        <nav
          className={`w-64 bg-white shadow-lg p-5 ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          <ul>
            {roleConfig.navigation.map((item: any) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`flex items-center p-3 rounded-md ${roleConfig.theme.colors.hover}`}
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
