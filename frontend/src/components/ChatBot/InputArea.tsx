import React, { useState } from "react";
import { Send, Smile } from "lucide-react";

interface InputAreaProps {
  onSendMessage: (text: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Quick action buttons for common food rescue questions
  const quickActions = [
    "How to donate food?",
    "Food rescue locations",
    "Volunteer opportunities",
    "Food safety guidelines",
  ];

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(action)}
            className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about food rescue, donations, or volunteering..."
          className="flex-1 p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 placeholder-gray-400"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 rounded-full ${
            message.trim()
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          } transition-colors duration-200`}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default InputArea;
