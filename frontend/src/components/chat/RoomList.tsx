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
  
  // Room states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showMyRoomsOnly, setShowMyRoomsOnly] = useState(false);
  
  // Load rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chat/rooms");
        setRooms(res.data);
        applyFilters(res.data);
      } catch (err) {
        console.error("Failed to load rooms", err);
      }
    };
    
    loadRooms();
  }, [currentUserId]);
  
  // Apply filters to rooms
  const applyFilters = (roomsList = rooms) => {
    let filtered = roomsList;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply privacy filters
    if (showPrivateOnly) {
      filtered = filtered.filter(room => room.isPrivate);
    } else if (showPublicOnly) {
      filtered = filtered.filter(room => !room.isPrivate);
    }
    
    // Apply "my rooms" filter
    if (showMyRoomsOnly) {
      filtered = filtered.filter(room => 
        room.members.includes(currentUserId) || room.createdBy === currentUserId
      );
    }
    
    setFilteredRooms(filtered);
  };
  
  useEffect(() => {
    applyFilters();
  }, [searchTerm, showPrivateOnly, showPublicOnly, showMyRoomsOnly, rooms]);
  
  // Select a room
  const selectRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowMobileRoomList(false);
    
    // Join the room via socket
    if (socket) {
      socket.emit("joinRoom", { roomId: room._id, userId: currentUserId });
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setShowPrivateOnly(false);
    setShowPublicOnly(false);
    setShowMyRoomsOnly(false);
  };
  
  // Check if user is a room member
  const isRoomMember = (room: Room) => {
    return room.members.includes(currentUserId);
  };
  
  // Join a room
  const joinRoom = async (room: Room) => {
    try {
      await axios.post(`http://localhost:5000/api/chat/rooms/${room._id}/join`, { userId: currentUserId });
      
      // Update local state
      setRooms(prev => 
        prev.map(r => 
          r._id === room._id 
            ? { ...r, members: [...r.members, currentUserId] } 
            : r
        )
      );
      
      // Join the room via socket
      if (socket) {
        socket.emit("joinRoom", { roomId: room._id, userId: currentUserId });
      }
    } catch (err) {
      console.error("Failed to join room", err);
    }
  };
  
  return (
    <>
      <div 
        className={`${
          selectedRoom && !showMobileRoomList ? "hidden md:flex" : "flex"
        } w-full md:w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex-col transition-all duration-300`}
      >
        {/* Header and Search */}
        <div className="p-4 space-y-3 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Users className={`h-5 w-5 ${theme.text} mr-2`} />
              <h3 className="font-medium text-gray-700">Chat Rooms</h3>
            </div>
            <button
              onClick={() => setShowCreateRoom(true)}
              className={`p-1.5 rounded-full ${theme.button} text-white hover:opacity-90 transition-all duration-200`}
              title="Create new room"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
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
          
          {/* Filter Options */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setShowPrivateOnly(prev => !prev);
                setShowPublicOnly(false);
              }}
              className={`px-2 py-1 text-xs rounded-full flex items-center whitespace-nowrap transition-all duration-200 ${
                showPrivateOnly 
                  ? `${theme.button} text-white` 
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Lock className="h-3 w-3 mr-1" />
              Private
            </button>
            <button
              onClick={() => {
                setShowPublicOnly(prev => !prev);
                setShowPrivateOnly(false);
              }}
              className={`px-2 py-1 text-xs rounded-full flex items-center whitespace-nowrap transition-all duration-200 ${
                showPublicOnly 
                  ? `${theme.button} text-white` 
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Globe className="h-3 w-3 mr-1" />
              Public
            </button>
            <button
              onClick={() => setShowMyRoomsOnly(prev => !prev)}
              className={`px-2 py-1 text-xs rounded-full flex items-center whitespace-nowrap transition-all duration-200 ${
                showMyRoomsOnly 
                  ? `${theme.button} text-white` 
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <User className="h-3 w-3 mr-1" />
              My Rooms
            </button>
          </div>
          
          {/* Reset Filters */}
          {(searchTerm || showPrivateOnly || showPublicOnly || showMyRoomsOnly) && (
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center transition-colors duration-200"
            >
              <X className="h-3 w-3 mr-1" />
              Reset filters
            </button>
          )}
        </div>
        
        {/* Rooms List */}
        <div className="overflow-y-auto flex-1 pt-2">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No rooms found</p>
              <button
                onClick={() => setShowCreateRoom(true)}
                className={`mt-4 px-4 py-2 ${theme.button} text-white rounded-lg text-sm flex items-center mx-auto`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create a room
              </button>
            </div>
          ) : (
            filteredRooms.map(room => (
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
            ))
          )}
        </div>
      </div>
      
      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          setShowCreateRoom={setShowCreateRoom}
          currentUserId={currentUserId}
          theme={theme}
          onRoomCreated={(newRoom) => {
            setRooms(prev => [...prev, newRoom]);
            selectRoom(newRoom);
          }}
        />
      )}
    </>
  );
};

// Room Card Component
const RoomCard: React.FC<{
  room: Room;
  selectedRoom: Room | null;
  selectRoom: (room: Room) => void;
  isRoomMember: boolean;
  joinRoom: (room: Room) => void;
  theme: any;
  currentUserId: string;
}> = ({ 
  room, 
  selectedRoom, 
  selectRoom, 
  isRoomMember, 
  joinRoom, 
  theme,
  currentUserId
}) => {
  // Get member name (simplified for this component)
  const getMemberName = (memberId: string): string => {
    return memberId === currentUserId ? "You" : "User";
  };

  return (
    <div
      onClick={() => selectRoom(room)}
      className={`mx-2 mb-2 rounded-lg border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
        selectedRoom && selectedRoom._id === room._id
          ? `border-l-4 ${theme.button} border-opacity-80 bg-white`
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h4 className={`font-medium ${selectedRoom && selectedRoom._id === room._id ? theme.text : "text-gray-800"}`}>
            {room.name}
          </h4>
          {room.isPrivate ? (
            <Lock className="h-3.5 w-3.5 text-gray-500" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-gray-500" />
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {room.description || "No description"}
        </p>
        
        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex items-center text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            <span>{room.members.length} members</span>
          </div>
          
          {!isRoomMember ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                joinRoom(room);
              }}
              className={`px-2 py-1 rounded ${theme.button} text-white text-xs flex items-center hover:opacity-90`}
            >
              <Plus className="h-3 w-3 mr-1" />
              Join
            </button>
          ) : (
            room.lastMessage && (
              <span className="text-gray-400">
                {formatTime(new Date(room.lastMessage.timestamp))}
              </span>
            )
          )}
        </div>
      </div>
      
      {room.lastMessage && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center">
            <p className="text-xs text-gray-600 line-clamp-1 flex-1">
              <span className="font-medium">
                {room.lastMessage.senderId === currentUserId ? "You" : getMemberName(room.lastMessage.senderId)}:
              </span>{" "}
              {room.lastMessage.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;