import React from "react";
import { X, Leaf } from "lucide-react";
import { organizationInfo } from "../../data/organizationData";

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <div className="bg-green-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <Leaf className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {organizationInfo.name} Assistant
          </h3>
          <p className="text-xs text-emerald-100 flex items-center">
            <span className="w-2 h-2 bg-emerald-300 rounded-full mr-2 animate-pulse"></span>
            Online | Ready to help
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-emerald-700 rounded-full transition-colors duration-200"
        aria-label="Close chat"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default ChatHeader;
