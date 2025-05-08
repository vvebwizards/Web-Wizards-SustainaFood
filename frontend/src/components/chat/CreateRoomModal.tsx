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
  const [joinCode, setJoinCode] = useState<string | null>(null);

  const createRoom = async () => {
    if (!roomForm.name.trim()) return;

    try {
      const newRoom = {
        ...roomForm,
        createdBy: currentUserId,
        members: [currentUserId]
      };
      const res = await axios.post("/api/chat/rooms", newRoom);
      onRoomCreated(res.data);
      if (res.data.isPrivate) setJoinCode(res.data.joinCode);
      else setShowCreateRoom(false);
    } catch (err) {
      console.error("Failed to create room", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create a New Room</h3>
          <button onClick={() => setShowCreateRoom(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {joinCode ? (
          <div>
            <p className="text-green-600 mb-4">Private room created! Share this code:</p>
            <div className="text-center font-mono text-lg bg-gray-100 p-2 rounded">{joinCode}</div>
            <button
              onClick={() => setShowCreateRoom(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Room name"
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={roomForm.isPrivate}
                onChange={(e) => setRoomForm({ ...roomForm, isPrivate: e.target.checked })}
                className="mr-2"
              />
              <span>Private room (requires code to join)</span>
            </div>
            <button onClick={createRoom} className={`w-full px-4 py-2 ${theme.button} text-white rounded`}>
              Create Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoomModal;
