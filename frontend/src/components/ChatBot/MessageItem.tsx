import React from "react";
import { Message } from "../../types/chat";
import { formatTime } from "../../utils/chatUtils";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
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
            ? "bg-green-100 text-green-800 rounded-bl-none"
            : "bg-blue-500 text-white rounded-br-none"
        }`}
      >
        <p className="text-sm sm:text-base">{message.text}</p>
        <span
          className={`text-xs ${
            isBot ? "text-green-700" : "text-blue-100"
          } block text-right mt-1`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
