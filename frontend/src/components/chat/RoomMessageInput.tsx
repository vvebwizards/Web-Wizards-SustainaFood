import React from 'react';
import { Send, UserPlus } from "lucide-react";
import { Room } from "../../types";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  sendMessage: () => void;
  isRoomMember: boolean;
  joinRoom: () => void;
  selectedRoom: Room;
  inputRef: React.RefObject<HTMLInputElement>;
  theme: any;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  sendMessage,
  isRoomMember,
  joinRoom,
  selectedRoom,
  inputRef,
  theme
}) => {
  // Handle key down for sending message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center relative">
        <input
          ref={inputRef}
          placeholder={isRoomMember ? "Type a message..." : "Join this room to send messages"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isRoomMember}
          className={`
            flex-1 border border-gray-300 rounded-full py-3 pl-5 pr-12 
            focus:outline-none focus:ring-2 focus:ring-opacity-50 
            transition-all duration-200 
            ${isRoomMember ? "bg-gray-50 hover:bg-white" : "bg-gray-100 text-gray-500"}
          `}
          style={{
            focusRing: theme.text.replace("text-", ""),
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || !isRoomMember}
          className={`absolute right-3 p-2 rounded-full transition-all duration-300 ${
            message.trim() && isRoomMember
              ? `${theme.button} text-white scale-100 hover:scale-105 hover:shadow-md`
              : "bg-gray-200 text-gray-400 cursor-not-allowed scale-90"
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      
      {!isRoomMember && (
        <div className="text-center mt-3">
          <button
            onClick={joinRoom}
            className={`px-4 py-1.5 ${theme.button} text-white text-sm rounded-full hover:opacity-90`}
          >
            <UserPlus className="h-4 w-4 inline-block mr-1" />
            Join this room to send messages
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageInput;