import React, { useEffect, useState } from "react";
import { MessageCircle, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DirectMessages from "./chat/DirectMessages";
import RoomChat from "./chat/RoomChat";
import ChatTabs from "./chat/ChatTabs";

const Chat: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || "recipient";

  // Active tab state
  const [activeTab, setActiveTab] = useState<"direct" | "rooms">("direct");

  // This effect runs once when component mounts
  useEffect(() => {
    // Set page title
    document.title = "Chat | Messages";
    
    return () => {
      // Reset title on unmount
      document.title = document.querySelector('[data-default]')?.textContent || "Chat Application";
    };
  }, []);

  return (
    <div className="flex flex-col rounded-xl shadow-2xl bg-white overflow-hidden h-screen border border-gray-100 w-full transition-all duration-300">
      {/* Tabs Navigation */}
      <ChatTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole} 
      />

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "direct" ? (
          <DirectMessages />
        ) : (
          <RoomChat />
        )}
      </div>
    </div>
  );
};

export default Chat;