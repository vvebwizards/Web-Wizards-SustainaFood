import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { Message } from '../../types/chat';
import { generateBotResponse } from '../../utils/chatUtils';
import { MessageCircle } from 'lucide-react';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help with any food rescue questions. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsTyping(true);
    
    try {
      const botResponse = await generateBotResponse(text);
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error handling message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="flex items-center justify-center p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}
      
      {isOpen && (
        <div className="flex flex-col w-full sm:w-96 h-[500px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 animate-fade-in">
          <ChatHeader onClose={toggleChat} />
          <MessageList messages={messages} isTyping={isTyping} />
          <InputArea onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
};

export default ChatBot;