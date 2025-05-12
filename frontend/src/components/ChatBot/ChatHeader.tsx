import React from "react";
import { X, Leaf } from "lucide-react";
import { organizationInfo } from "../../data/organizationData";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserId } from "../../utils/chatHelpers";
import { roleConfigs } from "../../utils/roleConfigs";

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  const { search } = useLocation();
  const { user } = useAuth();
  const currentUserId = getUserId(user);
  const params = new URLSearchParams(search);
  const initialPartner = params.get("user") || "";

  const userRole = user?.role || "donor";
  const theme =
    roleConfigs[userRole]?.theme.colors || roleConfigs.donor.theme.colors;
  return (
    <div
      className={`${theme.button} text-white p-4 flex justify-between items-center`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <Leaf className={`w-6 h-6 ${theme.text}`} />
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {organizationInfo.name} Assistant
          </h3>
          <p className={`text-xs ${theme.textAccent} flex items-center`}>
            <span
              className={`w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse`}
            ></span>
            Online | Ready to help
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className={`p-2 hover:${theme.hover} rounded-full transition-colors duration-200`}
        aria-label="Close chat"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default ChatHeader;
