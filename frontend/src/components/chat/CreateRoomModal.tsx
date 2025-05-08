import React, { useState } from 'react';
import { X } from "lucide-react";
import axios from "axios";
import { Room } from "../../types.ts";

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

  // Create a new room
  const createRoom = async () => {
    if (!roomForm.name.trim()) return;
    
    try {
      const newRoom = {
        ...roomForm,
        createdBy: currentUserId,
        members: [currentUserId]
      };
      
      const res = await axios.post("http://localhost:5000/api/chat/rooms", newRoom);
      onRoomCreated(res.data);
      setShowCreateRoom(false);
    } catch (err) {
      console.error("Failed to create room", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create a New Room</h3>
          <button 
            onClick={() => setShowCreateRoom(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={roomForm.name}
              onChange={(e) => setRoomForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter room name"
            />
          </div>
          
          <div>
            <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="roomDescription"
              value={roomForm.description}
              onChange={(e) => setRoomForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What's this room about?"
              rows={3}
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="isPrivate"
              type="checkbox"
              checked={roomForm.isPrivate}
              onChange={(e) => setRoomForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
              Private Room (Invite only)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowCreateRoom(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={createRoom}
              disabled={!roomForm.name.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                roomForm.name.trim() 
                  ? `${theme.button} hover:opacity-90` 
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;