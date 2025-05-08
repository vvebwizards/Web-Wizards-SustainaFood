import React from 'react';
import { Users, MessageCircle, Plus } from "lucide-react";
import { roleConfigs } from "../../utils/roleConfigs";

interface EmptyStateProps {
  type: 'rooms' | 'messages';
  message: string;
  subMessage: string;
  userRole: string;
  onClick?: () => void;
  buttonText?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  subMessage,
  userRole,
  onClick,
  buttonText
}) => {
  const theme = roleConfigs[userRole]?.theme.colors || roleConfigs.recipient.theme.colors;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className={`w-20 h-20 rounded-full ${theme.bg} flex items-center justify-center mb-6`}>
        {type === 'rooms' ? (
          <Users className={`h-10 w-10 ${theme.text}`} />
        ) : (
          <MessageCircle className={`h-10 w-10 ${theme.text}`} />
        )}
      </div>
      
      <h3 className="text-xl font-medium text-gray-800 mb-2">{message}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{subMessage}</p>
      
      {onClick && buttonText && (
        <button
          onClick={onClick}
          className={`px-6 py-2.5 ${theme.button} text-white rounded-lg text-sm flex items-center transition-all duration-200 hover:opacity-90 hover:shadow-md`}
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;