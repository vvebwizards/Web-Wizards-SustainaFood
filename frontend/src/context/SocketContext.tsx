import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Create the socket connection only once on mount
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // When both the socket and the user are available, register the user
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
