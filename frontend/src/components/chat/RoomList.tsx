import React, { useState, useEffect } from 'react';
import { Users, Search, X, Plus, Lock, Globe, User } from "lucide-react";
import axios from "axios";
import { Room } from "../../types";
import CreateRoomModal from "./CreateRoomModal";
import { useSocket } from "../../context/SocketContext";
import { formatTime } from "../../utils/chatHelpers";

interface RoomListProps {
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room) => void;
  showMobileRoomList: boolean;
  setShowMobileRoomList: (show: boolean) => void;
  showCreateRoom: boolean;
  setShowCreateRoom: (show: boolean) => void;
  currentUserId: string;
  theme: any;
}

const RoomList: React.FC<RoomListProps> = ({
  selectedRoom,
  setSelectedRoom,
  showMobileRoomList,
  setShowMobileRoomList,
  showCreateRoom,
  setShowCreateRoom,
  currentUserId,
  theme
}) => {
  const socket = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showMyRoomsOnly, setShowMyRoomsOnly] = useState(false);
  const [selectedPrivateRoom, setSelectedPrivateRoom] = useState<Room | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await axios.get("/api/chat/rooms");
        setRooms(res.data);
        applyFilters(res.data);
      } catch (err) {
        console.error("Failed to load rooms", err);
      }
    };
    loadRooms();
  }, [currentUserId]);

  const applyFilters = (roomsList = rooms) => {
    let filtered = roomsList;
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (showPrivateOnly) filtered = filtered.filter(room => room.isPrivate);
    if (showPublicOnly) filtered = filtered.filter(room => !room.isPrivate);
    if (showMyRoomsOnly) filtered = filtered.filter(room =>
      room.members.includes(currentUserId) || room.createdBy === currentUserId
    );
    setFilteredRooms(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, showPrivateOnly, showPublicOnly, showMyRoomsOnly, rooms]);

  const selectRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowMobileRoomList(false);
    if (socket) socket.emit("joinRoom", { roomId: room._id, userId: currentUserId });
  };

  const isRoomMember = (room: Room) => room.members.includes(currentUserId);

  const joinRoom = async (room: Room) => {
    if (room.isPrivate) {
      setSelectedPrivateRoom(room);
    } else {
      await axios.post(`/api/chat/rooms/${room._id}/join`, { userId: currentUserId });
      selectRoom(room);
    }
  };

  return (
    <>
      <div className={`${
        selectedRoom && !showMobileRoomList ? "hidden md:flex" : "flex"
      } w-full md:w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex-col transition-all duration-300`}>
        <div className="p-4 space-y-3 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Users className={`h-5 w-5 ${theme.text} mr-2`} />
              <h3 className="font-medium text-gray-700">Chat Rooms</h3>
            </div>
            <button
              onClick={() => setShowCreateRoom(true)}
              className={`p-1.5 rounded-full ${theme.button} text-white hover:opacity-90`}
              title="Create new room"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex space-x-2 mt-2 text-xs">
            <button onClick={() => {
                setShowPrivateOnly(!showPrivateOnly);
                setShowPublicOnly(false);
              }}
              className={`flex items-center px-2 py-1 rounded ${showPrivateOnly ? theme.button + " text-white" : "bg-gray-200 text-gray-700"}`}>
              <Lock className="h-3 w-3 mr-1" /> Private
            </button>
            <button onClick={() => {
                setShowPublicOnly(!showPublicOnly);
                setShowPrivateOnly(false);
              }}
              className={`flex items-center px-2 py-1 rounded ${showPublicOnly ? theme.button + " text-white" : "bg-gray-200 text-gray-700"}`}>
              <Globe className="h-3 w-3 mr-1" /> Public
            </button>
            <button onClick={() => setShowMyRoomsOnly(!showMyRoomsOnly)}
              className={`flex items-center px-2 py-1 rounded ${showMyRoomsOnly ? theme.button + " text-white" : "bg-gray-200 text-gray-700"}`}>
              <User className="h-3 w-3 mr-1" /> My Rooms
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pt-2">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              selectedRoom={selectedRoom}
              selectRoom={selectRoom}
              isRoomMember={isRoomMember(room)}
              joinRoom={joinRoom}
              theme={theme}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          setShowCreateRoom={setShowCreateRoom}
          currentUserId={currentUserId}
          theme={theme}
          onRoomCreated={(newRoom) => {
            setRooms((prev) => [...prev, newRoom]);
            selectRoom(newRoom);
          }}
        />
      )}

      {selectedPrivateRoom && (
        <PrivateJoinModal
          room={selectedPrivateRoom}
          onClose={() => setSelectedPrivateRoom(null)}
          onJoinSuccess={(room) => {
            setSelectedPrivateRoom(null);
            selectRoom(room);
          }}
          currentUserId={currentUserId}
          theme={theme}
        />
      )}
    </>
  );
};

const RoomCard = ({ room, selectedRoom, selectRoom, isRoomMember, joinRoom, theme }) => (
  <div onClick={() => selectRoom(room)} className={`mx-2 mb-2 rounded-lg border overflow-hidden cursor-pointer ${
      selectedRoom && selectedRoom._id === room._id ? `border-l-4 ${theme.button} border-opacity-80 bg-white` : "border-gray-200 bg-white hover:border-gray-300"}`}>
    <div className="p-3">
      <div className="flex items-center justify-between">
        <h4 className={`font-medium ${selectedRoom && selectedRoom._id === room._id ? theme.text : "text-gray-800"}`}>
          {room.name}
        </h4>
        {room.isPrivate ? <Lock className="h-3.5 w-3.5 text-gray-500" /> : <Globe className="h-3.5 w-3.5 text-gray-500" />}
      </div>
      <p className="text-xs text-gray-500 mt-1">{room.description || "No description"}</p>
      <div className="flex justify-between items-center mt-2 text-xs">
        <div className="flex items-center text-gray-500">
          <Users className="h-3 w-3 mr-1" />
          <span>{room.members.length} members</span>
        </div>
        {!isRoomMember ? (
          <button onClick={(e) => {
              e.stopPropagation();
              joinRoom(room);
            }} className={`px-2 py-1 rounded ${theme.button} text-white text-xs`}>
            <Plus className="h-3 w-3 mr-1" /> Join
          </button>
        ) : null}
      </div>
    </div>
  </div>
);

const PrivateJoinModal = ({ room, onClose, onJoinSuccess, currentUserId, theme }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    try {
      const res = await axios.post('/api/chat/rooms/join-by-code', { userId: currentUserId, code });
      if (res.data.roomId === room._id) {
        onJoinSuccess(room);
      } else {
        setError('Incorrect code');
      }
    } catch {
      setError('Incorrect code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-medium mb-4">Enter code for {room.name}</h3>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleJoin} className={`px-4 py-2 ${theme.button} text-white rounded`}>Join</button>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
