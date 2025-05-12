import React from "react";
import { MessageCircle, Users } from "lucide-react";
import { roleConfigs } from "../../utils/roleConfigs";

interface EmptyStateProps {
  type: "messages" | "rooms" | "contacts";
  message: string;
  subMessage?: string;
  userRole?: string;
  onClick?: () => void;
  buttonText?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  subMessage,
  userRole = "recipient",
  onClick,
  buttonText
}) => {
  const theme = roleConfigs[userRole].theme.colors;

  const getIcon = () => {
    switch (type) {
      case "messages": return <MessageCircle className={`h-10 w-10 ${theme.text}`} />;
      case "rooms": return <Users className={`h-10 w-10 ${theme.text}`} />;
      case "contacts": return <Users className="h-8 w-8 text-gray-400" />;
      default: return <MessageCircle className={`h-10 w-10 ${theme.text}`} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
      <div className={`w-20 h-20 rounded-full ${type === 'contacts' ? 'bg-gray-100' : theme.bg} flex items-center justify-center mb-4`}>
        {getIcon()}
      </div>
      <p className="font-medium text-gray-600">{message}</p>
      {subMessage && <p className="text-sm text-gray-400 mt-1 text-center">{subMessage}</p>}
      {onClick && buttonText && (
        <button
          onClick={onClick}
          className={`mt-6 px-5 py-2 ${theme.button} text-white rounded-full transition-colors flex items-center`}
        >
          {type === "rooms" ? <Users className="h-4 w-4 mr-2" /> : null}
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;