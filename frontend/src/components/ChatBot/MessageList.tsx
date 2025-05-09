import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 max-w-[80%] bg-green-100 text-green-800 p-3 rounded-lg rounded-bl-none animate-pulse">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animation-delay-200"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animation-delay-400"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;