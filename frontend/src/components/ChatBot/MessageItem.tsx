import React from "react";
import { Message } from "../../types/chat";
import { formatTime } from "../../utils/chatUtils";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserId } from "../../utils/chatHelpers";
import { roleConfigs } from "../../utils/roleConfigs";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { search } = useLocation();
  const { user } = useAuth();
  const currentUserId = getUserId(user);
  const params = new URLSearchParams(search);
  const initialPartner = params.get("user") || "";

  const userRole = user?.role || "donor";
  const theme =
    roleConfigs[userRole]?.theme.colors || roleConfigs.donor.theme.colors;
  const isBot = message.sender === "bot";

  return (
    <div
      className={`flex ${
        isBot ? "justify-start" : "justify-end"
      } animate-fade-in`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isBot
            ? `${theme.hover} ${theme.text} rounded-bl-none`
            : "bg-blue-500 text-white rounded-br-none"
        }`}
      >
        <p className="text-sm sm:text-base">{message.text}</p>
        <span
          className={`text-xs block text-right mt-1 ${
            isBot ? theme.text : "text-blue-100"
          }`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
