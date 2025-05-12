import React, { useEffect, useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  CheckCircle,
  ChevronDown,
  AlertCircle,
  MessageSquare,
  Gift,
  Award,
  Users,
  Star,
  Sparkles,
  Truck,
  Heart,
  Users as UsersIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Minimal roleConfigs inside this file
const roleConfigs: Record<string, any> = {
  admin: {
    theme: {
      primary: "red",
      colors: {
        bg: "bg-red-50",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        button: "bg-red-600 hover:bg-red-700",
      },
    },
  },
  donor: {
    theme: {
      primary: "green",
      colors: {
        bg: "bg-green-50",
        text: "text-green-700",
        hover: "hover:bg-green-100",
        button: "bg-green-600 hover:bg-green-700",
      },
    },
  },
  recipient: {
    theme: {
      primary: "blue",
      colors: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        button: "bg-blue-600 hover:bg-blue-700",
      },
    },
  },
  volunteer: {
    theme: {
      primary: "purple",
      colors: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
        button: "bg-purple-600 hover:bg-purple-700",
      },
    },
  },
};

const Notifications = () => {
  const { notifications, fetchNotifications, markAsRead } = useNotifications();
  const { user } = useAuth();
  const userRole = user?.role ?? "donor";
  const roleConfig = roleConfigs[userRole];

  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      await fetchNotifications();
      setIsLoading(false);
    };
    loadNotifications();
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const getNotificationIcon = (type: string) => {
    const iconClasses = "w-5 h-5";
    const color = roleConfig?.theme.colors.text || "text-indigo-500";
    switch (type) {
      case "alert":
        return <AlertCircle className={`${iconClasses} ${color}`} />;
      case "message":
        return <MessageSquare className={`${iconClasses} ${color}`} />;
      case "reward":
        return <Gift className={`${iconClasses} ${color}`} />;
      case "achievement":
        return <Award className={`${iconClasses} ${color}`} />;
      case "social":
        return <UsersIcon className={`${iconClasses} ${color}`} />;
      case "delivery":
        return <Truck className={`${iconClasses} ${color}`} />;
      default:
        return <Star className={`${iconClasses} ${color}`} />;
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === "unread") return !notification.isRead;
    if (selectedFilter === "read") return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleBg = roleConfig?.theme.colors.bg || "bg-indigo-50";
  const roleText = roleConfig?.theme.colors.text || "text-indigo-600";
  const roleHover = roleConfig?.theme.colors.hover || "hover:bg-indigo-100";
  const roleButton = roleConfig?.theme.colors.button || "bg-indigo-600 hover:bg-indigo-700";

  if (isLoading) {
    return (
      <div className={`min-h-screen ${roleBg} p-4 md:p-8`}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4 h-24 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${roleBg} p-4 md:p-8`}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className={`w-8 h-8 ${roleText}`} />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                  </motion.div>
                )}
              </div>
              <div>
                <h2
                  className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${roleText}`}
                >
                  Notifications
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Stay updated with your latest activities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.select
                whileTap={{ scale: 0.95 }}
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`px-4 py-2 rounded-full bg-gray-100 border-none text-sm font-medium text-gray-600 focus:ring-2 focus:ring-${roleConfig?.theme.primary}-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer`}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </motion.select>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${roleHover}`}
              >
                <Sparkles className={`w-4 h-4 ${roleText}`} />
                <span className={`text-sm font-medium ${roleText}`}>
                  {unreadCount} New
                </span>
              </motion.div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No notifications to display</p>
                <p className="text-gray-400 mt-2">Check back later for updates</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.slice(0, visibleCount).map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`
                      group relative overflow-hidden rounded-xl transition-all duration-300
                      ${notification.isRead 
                        ? 'bg-gray-50 hover:bg-gray-100' 
                        : `bg-white ${roleHover} border border-indigo-100 shadow-sm`
                      }
                    `}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm"
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-lg ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {notification.message}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                            <span>{getTimeAgo(notification.createdAt)}</span>
                            {!notification.isRead && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBg} ${roleText}`}>
                                New
                              </span>
                            )}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsRead(notification._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white ${roleButton} transition-colors duration-200`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark as read</span>
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        className={`absolute left-0 top-0 bottom-0 w-1 ${roleConfig?.theme.colors.button?.split(' ')[0]}`}
                      />
                    )}
                  </motion.div>
                ))}

                {visibleCount < filteredNotifications.length && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={loadMore}
                    className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors duration-200 group bg-white rounded-xl shadow-sm hover:shadow-md"
                  >
                    <span>Show More</span>
                    <ChevronDown className="w-4 h-4 group-hover:transform group-hover:translate-y-1 transition-transform duration-200" />
                  </motion.button>
                )}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
