import React, { useRef } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  message: string;
  setMessage: (value: string) => void;
  sendMessage: () => void;
  theme: {
    primary: string;
    colors: {
      bg: string;
      text: string;
      hover: string;
      button: string;
    };
  };
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  sendMessage,
  theme,
  placeholder = "Type a message..."
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) sendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`
            flex-1 
            border border-gray-300 
            rounded-full 
            py-3 pl-5 pr-12 
            focus:outline-none 
            focus:ring-2 
            focus:ring-opacity-50 
            transition
            ${theme.colors.bg}
            ${theme.colors.text}
          `}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!message.trim()}
          className={`
            absolute right-4 
            flex items-center justify-center 
            ${theme.colors.button} 
            text-white 
            rounded-full 
            p-2 
            focus:outline-none 
            focus:ring-2 
            focus:ring-${theme.primary}-500 
            disabled:opacity-50 
            disabled:cursor-not-allowed
          `}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
