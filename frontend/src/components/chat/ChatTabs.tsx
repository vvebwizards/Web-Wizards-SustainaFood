import React from "react";
import { MessageCircle, Users } from "lucide-react";
import { roleConfigs } from "../../utils/roleConfigs";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "./UserAvatar";
import { User } from "../../types";

interface ChatTabsProps {
  activeTab: "direct" | "rooms";
  setActiveTab: (tab: "direct" | "rooms") => void;
  userRole: string;
}

const ChatTabs: React.FC<ChatTabsProps> = ({ 
  activeTab, 
  setActiveTab,
  userRole 
}) => {
  const { user } = useAuth();
  const theme = 
    roleConfigs[userRole as keyof typeof roleConfigs]?.theme.colors || 
    roleConfigs.recipient.theme.colors;

  return (
    <div className={`flex justify-between items-center px-6 py-4 ${theme.button} text-white`}>
      <div className="flex space-x-1">
        <button
          onClick={() => setActiveTab("direct")}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "direct"
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/10"
          }`}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          <span className="font-medium">Direct Messages</span>
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "rooms"
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/10"
          }`}
        >
          <Users className="mr-2 h-5 w-5" />
          <span className="font-medium">Rooms</span>
          <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
            New
          </span>
        </button>
      </div>
      <div className="flex items-center space-x-2">
        {user?.username && (
          <>
            <UserAvatar user={user as User} />
            <div className="text-sm">{user.username}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatTabs;