import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth(); 
  const [isSocketInitialized, setIsSocketInitialized] = useState(false); 

  useEffect(() => {
    if (!user || isSocketInitialized) return; 

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    setIsSocketInitialized(true);

    newSocket.on("connect", () => {
      newSocket.emit("user_connected", user.id);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, isSocketInitialized]); 

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};
