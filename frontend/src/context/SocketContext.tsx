import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    if (user) {
      setTimeout(() => {
        newSocket.emit("registerUser", user.id);
        console.log(`📡 Registered user ${user.id} with WebSocket.`);
      }, 1000); // ⏳ **Give time for backend**
    }

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  return useContext(SocketContext);
};
