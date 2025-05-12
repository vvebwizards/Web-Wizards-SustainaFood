import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; 
import { useSocket } from "./SocketContext";

interface Notification {
  _id: string; 
  userId: string; 
  message: string; 
  isRead: boolean; 
  createdAt: string; 
}

const API_BASE_URL = "http://localhost:5000/api/notifications";


interface NotificationContextType {
  notifications: Notification[]; 
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>; 
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const socket = useSocket(); 
  const [notifications, setNotifications] = useState<Notification[]>([]);

 
  const fetchNotifications = async () => {
    if (!user || !user.id) {
      console.warn("⚠️ No user found, skipping notifications fetch.");
      return;
    }
  
    try {
      console.log(`📡 Fetching notifications for user ${user.id}`);
      const response = await axios.get(`${API_BASE_URL}/${user.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  };
  
  useEffect(() => {
    if (!user) {
      console.warn("No user available, skipping notifications fetch.");
      return;
    }
    fetchNotifications();
  }, [user]);
  
  

 
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };


  useEffect(() => {
    if (!socket || !user) {
      console.warn("⚠️ No user found, skipping notifications fetch.");
      return;
    }

    socket.on("new_notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]); 
    });

    return () => {
      socket.off("new_notification");
    };
  }, [socket, user]);

  useEffect(() => {
    if (!user || !user.id) {
      console.warn("⚠️ No user found, skipping notifications fetch.");
      return;
    }
  
    fetchNotifications();
  }, [user]);
  

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};