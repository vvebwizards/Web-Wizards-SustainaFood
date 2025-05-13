import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Copy, Shield, MessageSquare, Info } from "lucide-react";
import api from "../../config/axios";

interface Room {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  joinCode?: string;
  createdBy: string;
  members: string[];
  createdAt?: string;
}

interface RoomFormData {
  name: string;
  description: string;
  isPrivate: boolean;
}

interface CreateRoomModalProps {
  setShowCreateRoom: (show: boolean) => void;
  currentUserId: string;
  theme: any;
  onRoomCreated: (room: Room) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  setShowCreateRoom,
  currentUserId,
  theme,
  onRoomCreated
}) => {
  const [roomForm, setRoomForm] = useState<RoomFormData>({
    name: "",
    description: "",
    isPrivate: false
  });
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<{name?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setModalVisible(true);
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 10);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => setShowCreateRoom(false), 300);
  };

  const validateForm = (): boolean => {
    const newErrors: {name?: string} = {};
    
    if (!roomForm.name.trim()) {
      newErrors.name = "Room name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createRoom = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post("/chat/rooms", {
        name: roomForm.name,
        description: roomForm.description,
        isPrivate: roomForm.isPrivate,
        createdBy: currentUserId,
        members: [currentUserId]
      });
      
      onRoomCreated(response.data);
      
      if (response.data.isPrivate) {
        setJoinCode(response.data.joinCode);
      } else {
        handleClose();
      }
    } catch (err) {
      console.error("Failed to create room", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error("Failed to copy", err));
    }
  };

  // Extract the background color class from theme.button
  const themeColorClass = theme.button.split(' ')[0];
  const iconColorClass = themeColorClass.replace('bg-', 'text-');
  const iconBgClass = themeColorClass.replace('bg-', 'bg-') + '/10';
  const iconHoverBgClass = themeColorClass.replace('bg-', 'hover:bg-') + '/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
         style={{ opacity: modalVisible ? 1 : 0 }}>
      <div 
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${modalVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MessageSquare className={`h-5 w-5 mr-2 ${iconColorClass}`} />
            Create a New Room
          </h3>
          <button 
            onClick={handleClose} 
            className={`${iconColorClass} ${iconHoverBgClass} transition-colors rounded-full p-1`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {joinCode ? (
            <div className="flex flex-col items-center">
              <div className={`${iconBgClass} ${iconColorClass} p-3 rounded-full mb-4`}>
                <Check className="h-8 w-8" />
              </div>
              
              <h4 className="text-xl font-medium text-gray-900 mb-2">Room Created!</h4>
              <p className="text-gray-600 mb-6 text-center">
                Share this code with others to join your private room:
              </p>
              
              <div className="relative w-full mb-6">
                <div className="font-mono text-lg bg-gray-50 p-4 rounded-lg border flex items-center justify-between">
                  <div className="overflow-x-auto whitespace-nowrap scrollbar-hidden pr-2">
                    {joinCode}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className={`p-2 rounded-md transition-colors ${copied ? `${iconBgClass} ${iconColorClass}` : `${iconHoverBgClass} ${iconColorClass}`}`}
                    aria-label="Copy to clipboard"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                
                {copied && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm py-1 px-3 rounded shadow opacity-90 transition-opacity">
                    Copied!
                  </div>
                )}
              </div>
              
              <button
                onClick={handleClose}
                className={`w-full px-4 py-3 ${theme.button} text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  id="room-name"
                  ref={nameInputRef}
                  type="text"
                  placeholder="Enter a name for your room"
                  value={roomForm.name}
                  onChange={(e) => {
                    setRoomForm({ ...roomForm, name: e.target.value });
                    if (errors.name) setErrors({});
                  }}
                  className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="room-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="room-description"
                  placeholder="What's this room about?"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors min-h-[100px] resize-none"
                />
              </div>
              
              <div className="flex items-center bg-gray-50 p-4 rounded-lg border">
                <div className={`mr-4 flex-shrink-0 p-2 ${iconBgClass} rounded-full ${iconColorClass}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <label htmlFor="is-private" className="flex items-center cursor-pointer">
                    <div className="mr-3">
                      <div className="text-sm font-medium text-gray-900">Private Room</div>
                      <div className="text-xs text-gray-500">A code will be required to join</div>
                    </div>
                    <div className="relative">
                      <input
                        id="is-private"
                        type="checkbox"
                        checked={roomForm.isPrivate}
                        onChange={(e) => setRoomForm({ ...roomForm, isPrivate: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 ${roomForm.isPrivate ? theme.button : 'bg-gray-300'} rounded-full shadow-inner transition-colors`}></div>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transform transition-transform ${roomForm.isPrivate ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>
              
              <button 
                onClick={createRoom} 
                disabled={isSubmitting}
                className={`w-full px-4 py-3 ${theme.button} text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 transform active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;