import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("https://foodreduce-backend.azurewebsites.net", {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit("registerUser", user.id);
      console.log(`📡 Registered user ${user.id} with WebSocket.`);
    }
  }, [socket, user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  return useContext(SocketContext);
};
