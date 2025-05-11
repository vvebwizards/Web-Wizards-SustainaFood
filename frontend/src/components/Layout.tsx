// src/components/Layout.tsx
import React, { useState, useEffect } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketContext";
import {
  Menu,
  Bell,
  ShoppingCart,
  Building2,
  UserCog,
  Package,
  Truck,
  LineChart,
  Database,
  AlertTriangle,
  User,
  Heart,
  Calendar,
  MapPin,
  History,
  Users,
  Clock,
  MessageSquare,
  Gauge,
  Gamepad2,
  Gift,
  Crown,
  Leaf,
} from "lucide-react";
import defaultProfileImage from "../assets/images/default_user_img.jpg";

// --- shape returned by your /api/chat/recent endpoint ---
interface RecentMessage {
  _id: string;
  senderId: string;
  recipientId: string;
  partnerId: string;
  partnerName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  profileImage?: string;
}

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
}

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
      { to: "/dashboard/profile", icon: User, label: "Profile" },
      { to: "/dashboard/chat", icon: MessageSquare, label: "Communications" },
      { to: "/dashboard/overview", icon: Gauge, label: "System Overview" },
      { to: "/dashboard/StatsDashboard", icon: LineChart, label: "Analytics" },
      { to: "/dashboard/UsersManagement", icon: UserCog, label: "User Management"},
      { to: "/dashboard/donations", icon: Package, label: "Donations" },
      { to: "/dashboard/deliveries", icon: Truck, label: "Deliveries" },
      { to: "/dashboard/database", icon: Database, label: "Database" },
      { to: "/dashboard/leaderboard", icon: Crown, label: "Leaderboard"},
      { to: "/dashboard/notifications", icon: AlertTriangle, label: "System Alerts"},
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
      { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
      { to: "/dashboard/chat", icon: MessageSquare, label: "Communications" },
      { to: "/dashboard/inventory", icon: Package, label: "Inventory" },
      { to: "/dashboard/my-donations", icon: Heart, label: "My Donations" },
      { to: "/dashboard/schedule", icon: Calendar, label: "Schedule Pickup" },
      { to: "/dashboard/statistics", icon: LineChart, label: "Impact" },
      { to: "/dashboard/leaderboard", icon: Crown, label: "Leaderboard" },
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
      { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
      { to: "/dashboard/chat", icon: MessageSquare, label: "Communications" },
      { to: "/dashboard/available", icon: Package, label: "Available Food" },
      { to: "/dashboard/my-requests", icon: Heart, label: "My Requests" },
      { to: "/dashboard/location", icon: MapPin, label: "Delivery Location" },
      { to: "/dashboard/statistics", icon: LineChart, label: "Received Items" },
      { to: "/dashboard/leaderboard", icon: Crown, label: "Leaderboard" },
      
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
      { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
      { to: "/dashboard/chat", icon: MessageSquare, label: "Communications" },
      { to: "/dashboard/orders", icon: Package, label: "Orders" },
      { to: "/dashboard/deliveries", icon: Truck, label: "Deliveries suggested routes" },
      { to: "/dashboard/carbon", icon: Leaf, label: "Carbon FootPrint Prediction" },
      { to: "/dashboard/locations", icon: MapPin, label: "Delivery Locations" },
      { to: "/dashboard/schedule", icon: Calendar, label: "My Schedule" },
      { to: "/dashboard/leaderboard", icon: Crown, label: "Leaderboard" },
      { to: "/dashboard/statistics", icon: LineChart, label: "Impact" },
    ],
  },
};

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const currentUserId = user?._id || user?.id || "";
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAsRead } = useNotifications();
  const { cartItems } = useCart();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const socket = useSocket();

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [points, setPoints] = useState<number>(
    user?.points ?? parseInt(localStorage.getItem("points") || "0", 10)
  );

  const userRole = user?.role ?? "donor";
  const roleConfig = roleConfigs[userRole]!;

  useEffect(() => {
    if (user?.points != null) setPoints(user.points);
    if (user?.profileImage) {
      const url = user.profileImage.startsWith("http")
        ? user.profileImage
        : `http://localhost:5000${user.profileImage}`;
      setProfileImage(`${url}?t=${Date.now()}`);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    fetchRecentMessages();
    if (!socket) return;
    const handler = (msg: { senderId: string; recipientId: string }) => {
      if (msg.recipientId === currentUserId) {
        fetchRecentMessages();
      }
    };
    socket.on("privateMessage", handler);
    return () => {
      socket.off("privateMessage", handler);
    };
  }, [socket, currentUserId]);

  const fetchRecentMessages = async () => {
    if (!currentUserId) return;

    try {
      const res = await fetch(`/api/chat/recent/${currentUserId}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data: RecentMessage[] = await res.json();
      const filtered = data.filter((m) => m.senderId !== currentUserId);

      setRecentMessages(filtered);
      setUnreadMessageCount(filtered.filter((m) => !m.isRead).length);
    } catch (err) {
      console.error("Failed to fetch recent messages:", err);
    }
  };

  const markMessageAsRead = async (msgId: string) => {
    try {
      await fetch(`/api/chat/read/${msgId}`, { method: "PUT" });
      setRecentMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, isRead: true } : m))
      );
      setUnreadMessageCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMessageClick = async (msgId: string, partnerId: string) => {
    await markMessageAsRead(msgId);
    setIsMessageOpen(false);
    navigate(`/dashboard/chat?user=${partnerId}`);
  };

  const formatRelativeTime = (ts: string) => {
    const diffMins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const hrs = Math.floor(diffMins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const displayRoleName = roleNames[userRole] || "User";

  const handleLogout = () => {
    logout();
    navigate("/signin");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("points");
    localStorage.removeItem("userRole"); 
    localStorage.removeItem("user");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full bg-white shadow px-6 py-4 flex justify-between items-center z-50">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center space-x-2">
            <roleConfig.theme.icon
              className={`h-6 w-6 ${roleConfig.theme.colors.header}`}
            />
            <span className="text-xl font-semibold">{displayRoleName}</span>
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          <NavLink
            to="/dashboard/redeem"
            className="flex items-center space-x-1"
          >
            <span
              className={`font-semibold text-sm ${roleConfig.theme.colors.text}`}
            >
              {points} pts
            </span>
            <Gift className="h-6 w-6" />
          </NavLink>

          <NavLink to="/dashboard/game-center" className="p-2">
            <Gamepad2 className="h-6 w-6" />
          </NavLink>

          <div className="relative">
            <button
              onClick={() => setIsMessageOpen(!isMessageOpen)}
              className="relative p-2"
            >
              <MessageSquare className="h-6 w-6" />
              {unreadMessageCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadMessageCount}
                </span>
              )}
            </button>
            {isMessageOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                <div
                  className={`${roleConfig.theme.colors.bg} p-3 flex justify-between`}
                >
                  <span
                    className={`${roleConfig.theme.colors.text} font-medium`}
                  >
                    Recent Messages
                  </span>
                  <span className="text-xs">{recentMessages.length}</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {recentMessages.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <ul>
                      {recentMessages.map((m) => (
                        <li
                          key={m._id}
                          onClick={() => handleMessageClick(m._id, m.partnerId)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium truncate">
                              {m.senderId === currentUserId
                                ? `You → ${m.partnerName}`
                                : m.partnerName}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(m.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {m.content}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {recentMessages.length > 0 && (
                  <div className="border-t p-3">
                    <Link
                      to={`/dashboard/chat?user=${recentMessages[0].partnerId}`}
                      className={`${roleConfig.theme.colors.text} text-sm w-full block text-center`}
                      onClick={() => setIsMessageOpen(false)}
                    >
                      See All Messages
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (isMessageOpen) setIsMessageOpen(false);
              }}
              className="relative p-2"
            >
              <Bell className="h-6 w-6" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
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

          {userRole === "recipient" && (
            <NavLink to="/dashboard/cart" className="relative p-2">
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
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
              (e.currentTarget as HTMLImageElement).src = defaultProfileImage;
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
          className={`w-64 bg-white p-5 ${sidebarOpen ? "block" : "hidden"}`}
        >
          <ul>
            {roleConfig.navigation.map((item: any) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`flex items-center p-3 rounded-md ${roleConfig.theme.colors.hover}`}
                >
                  <item.icon className="h-6 w-6 mr-2" />
                  <span>{item.label}</span>
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
