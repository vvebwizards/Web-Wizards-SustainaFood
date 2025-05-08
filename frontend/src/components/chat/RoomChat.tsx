import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Users,
  ArrowLeft,
  Search,
  X,
  Plus,
  Lock,
  UserPlus,
  Globe,
  Edit,
  Info,
  User
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { ChatMessage, Room, User as UserType } from "../../types.ts";
import { formatTime, getMessageDay, getUserId } from "../../utils/chatHelpers";
import { roleConfigs } from "../../utils/roleConfigs";
import UserAvatar from "./UserAvatar";
import EmptyState from "./EmptyState";

interface RoomFormData {
  name: string;
  description: string;
  isPrivate: boolean;
}

const RoomChat: React.FC = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const currentUserId = getUserId(user);
  const userRole = user?.role || "recipient";
  const theme = roleConfigs[userRole]?.theme.colors || roleConfigs.recipient.theme.colors;
  
  // Room states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomMembers, setRoomMembers] = useState<UserType[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [showMobileRoomList, setShowMobileRoomList] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showMyRoomsOnly, setShowMyRoomsOnly] = useState(false);
  
  // Create room states
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState<RoomFormData>({
    name: "",
    description: "",
    isPrivate: false
  });
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Socket connection for room messages
  useEffect(() => {
    if (!socket || !selectedRoom) return;
    const handleRoomMessage = (msg: any) => {
      if (msg.roomId !== selectedRoom._id) return;
      setMessages(prev => [
        ...prev,
        {
          content:   msg.content,
          senderId:  msg.senderId,
          roomId:    msg.roomId,
          type:      'room',
          timestamp: new Date(msg.createdAt)
        }
      ]);
    };
    socket.on('roomMessage', handleRoomMessage);
    return () => { socket.off('roomMessage', handleRoomMessage); };
  }, [socket, selectedRoom]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Load room messages when selecting a room
  async function loadRoomMessages(roomId: string) {
    const res = await axios.get(`/api/chat/rooms/${roomId}/messages`);
    const loaded = res.data.map((m: any) => ({
      content:   m.content,
      senderId:  m.senderId,
      roomId:    m.roomId,
      type:      'room',
      timestamp: new Date(m.createdAt)
    }));
    setMessages(loaded);
  }
  
  // Load room members when selecting a room
  const loadRoomMembers = async (roomId: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/rooms/${roomId}/members`);
      setRoomMembers(res.data);
    } catch (err) {
      console.error("Failed to load room members", err);
      setRoomMembers([]);
    }
  };
  
  // Select a room
  const selectRoom = (room: Room) => {
    setSelectedRoom(room);
    loadRoomMessages(room._id);
    loadRoomMembers(room._id);
    setShowMobileRoomList(false);
    setTimeout(() => inputRef.current?.focus(), 50);
    
    // Join the room via socket
    if (socket) {
      socket.emit("joinRoom", { roomId: room._id, userId: currentUserId });
    }
  };
  
  // Send a message to the room
  const sendMessage = async () => {
    if (!socket || !selectedRoom || !message.trim()) return;
  
    // Build payload for HTTP + socket
    const payload = {
      content:  message,
      senderId: currentUserId
    };
  
    try {
      // 1) Persist to the DB
      await axios.post(
        `/api/chat/rooms/${selectedRoom._id}/messages`,
        payload
      );
  
      // 2) Broadcast in real-time
      socket.emit("roomMessage", {
        ...payload,
        roomId: selectedRoom._id
      });
  
      // 3) Echo locally immediately
      setMessages(prev => [
        ...prev,
        {
          ...payload,
          roomId:    selectedRoom._id,
          type:      "room",
          timestamp: new Date()
        }
      ]);
  
      // 4) Clear input
      setMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
      // optional: show user feedback/toast here
    }
  };
  
  
  // Handle key down for sending message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
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
      setRooms(prev => [...prev, res.data]);
      selectRoom(res.data);
      setShowCreateRoom(false);
      setRoomForm({
        name: "",
        description: "",
        isPrivate: false
      });
    } catch (err) {
      console.error("Failed to create room", err);
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
      
      // If this is the selected room, update members
      if (selectedRoom && selectedRoom._id === room._id) {
        loadRoomMembers(room._id);
      }
      
      // Join the room via socket
      if (socket) {
        socket.emit("joinRoom", { roomId: room._id, userId: currentUserId });
      }
    } catch (err) {
      console.error("Failed to join room", err);
    }
  };
  
  // Leave a room
  const leaveRoom = async (room: Room) => {
    try {
      await axios.post(`http://localhost:5000/api/chat/rooms/${room._id}/leave`, { userId: currentUserId });
      
      // Update local state
      setRooms(prev => 
        prev.map(r => 
          r._id === room._id 
            ? { ...r, members: r.members.filter(id => id !== currentUserId) } 
            : r
        )
      );
      
      // If this is the selected room, update members
      if (selectedRoom && selectedRoom._id === room._id) {
        loadRoomMembers(room._id);
      }
      
      // Leave the room via socket
      if (socket) {
        socket.emit("leaveRoom", { roomId: room._id, userId: currentUserId });
      }
    } catch (err) {
      console.error("Failed to leave room", err);
    }
  };
  
  // Find the member's name by ID
  const getMemberName = (memberId: string): string => {
    const member = roomMembers.find(m => getUserId(m) === memberId);
    return member ? member.username : "Unknown User";
  };
  
  return (
    <>
      {/* Rooms List Sidebar */}
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
              <div
                key={room._id}
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
                    
                    {!isRoomMember(room) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          joinRoom(room);
                        }}
                        className={`px-2 py-1 rounded ${theme.button} text-white text-xs flex items-center hover:opacity-90`}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
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
            ))
          )}
        </div>
        
        {/* Create Room Modal */}
        {showCreateRoom && (
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
        )}
      </div>
      
      {/* Chat Area */}
      <div
        className={`${
          !selectedRoom && !showMobileRoomList ? "hidden" : "flex"
        } flex-1 flex flex-col bg-white transition-all duration-300`}
      >
        {selectedRoom ? (
          <>
            {/* Room Header */}
            <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center">
                <button
                  className="md:hidden mr-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  onClick={() => setShowMobileRoomList(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                <div className={`w-10 h-10 rounded-full ${theme.bg} flex items-center justify-center mr-3`}>
                  <Users className={`h-5 w-5 ${theme.text}`} />
                </div>
                
                <div>
                  <div className="font-medium text-gray-800 flex items-center">
                    {selectedRoom.name}
                    {selectedRoom.isPrivate && <Lock className="h-3.5 w-3.5 ml-2 text-gray-500" />}
                  </div>
                  <div className="text-xs text-gray-500">
                    {roomMembers.length} members
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <button
                  onClick={() => {
                    const isCurrentlyMember = isRoomMember(selectedRoom);
                    if (isCurrentlyMember) {
                      leaveRoom(selectedRoom);
                    } else {
                      joinRoom(selectedRoom);
                    }
                  }}
                  className={`text-xs flex items-center px-3 py-1.5 rounded-full ${
                    isRoomMember(selectedRoom)
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : `${theme.button} text-white hover:opacity-90`
                  }`}
                >
                  {isRoomMember(selectedRoom) ? (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Leave
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      Join
                    </>
                  )}
                </button>
                
                <button
                  className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Room information"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white space-y-4"
            >
              {messages.length === 0 ? (
                <EmptyState
                  type="rooms"
                  message="No messages in this room yet"
                  subMessage="Be the first to send a message to this room"
                  userRole={userRole}
                />
              ) : (
                <div className="space-y-6">
                  {(() => {
                    let currentDay = "";
                    let lastSenderId = "";
                    
                    return messages.map((msg, idx) => {
                      const isUser = msg.senderId === currentUserId;
                      const messageDay = getMessageDay(msg.timestamp);
                      const showDayDivider = messageDay !== currentDay;
                      const showSender = msg.senderId !== lastSenderId || showDayDivider;
                      
                      lastSenderId = msg.senderId;
                      
                      let result = [];
                      
                      if (showDayDivider) {
                        currentDay = messageDay;
                        result.push(
                          <div key={`day-${idx}`} className="flex items-center justify-center my-4">
                            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {messageDay}
                            </div>
                          </div>
                        );
                      }
                      
                      const sender = roomMembers.find(m => getUserId(m) === msg.senderId) || null;
                      
                      result.push(
                        <div
                          key={idx}
                          className={`flex ${
                            isUser ? "justify-end" : "justify-start"
                          } group items-end ${
                            !showSender && !isUser ? "pl-10" : ""
                          }`}
                        >
                          {!isUser && showSender && (
                            <div className="mr-2 flex-shrink-0">
                              <UserAvatar user={sender} size="sm" />
                            </div>
                          )}
                          
                          <div className="flex flex-col">
                            {showSender && !isUser && (
                              <div className="text-xs text-gray-500 mb-1 ml-1">
                                {sender?.username || "Unknown user"}
                              </div>
                            )}
                            
                            <div
                              className={`
                                max-w-[75%] px-4 py-2 rounded-2xl shadow-sm
                                ${
                                  isUser
                                    ? `${theme.button} text-white rounded-br-none`
                                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                }
                                transform transition-all duration-200 hover:scale-[1.01] group-hover:shadow-md
                              `}
                            >
                              <div className="whitespace-pre-wrap break-words">
                                {msg.content}
                              </div>
                              <div
                                className={`text-[10px] text-right mt-1 ${
                                  isUser
                                    ? "text-white/70"
                                    : "text-gray-400"
                                }`}
                              >
                                {formatTime(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          {isUser && showSender && (
                            <div className="ml-2 flex-shrink-0">
                              <UserAvatar user={user as UserType} size="sm" />
                            </div>
                          )}
                        </div>
                      );
                      
                      return result;
                    }).flat();
                  })()}
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center relative">
                <input
                  ref={inputRef}
                  placeholder={isRoomMember(selectedRoom) ? "Type a message..." : "Join this room to send messages"}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isRoomMember(selectedRoom)}
                  className={`
                    flex-1 border border-gray-300 rounded-full py-3 pl-5 pr-12 
                    focus:outline-none focus:ring-2 focus:ring-opacity-50 
                    transition-all duration-200 
                    ${isRoomMember(selectedRoom) ? "bg-gray-50 hover:bg-white" : "bg-gray-100 text-gray-500"}
                  `}
                  style={{
                    focusRing: theme.text.replace("text-", ""),
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || !isRoomMember(selectedRoom)}
                  className={`absolute right-3 p-2 rounded-full transition-all duration-300 ${
                    message.trim() && isRoomMember(selectedRoom)
                      ? `${theme.button} text-white scale-100 hover:scale-105 hover:shadow-md`
                      : "bg-gray-200 text-gray-400 cursor-not-allowed scale-90"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              
              {!isRoomMember(selectedRoom) && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => joinRoom(selectedRoom)}
                    className={`px-4 py-1.5 ${theme.button} text-white text-sm rounded-full hover:opacity-90`}
                  >
                    <UserPlus className="h-4 w-4 inline-block mr-1" />
                    Join this room to send messages
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <EmptyState
            type="rooms"
            message="Welcome to Chat Rooms"
            subMessage="Select a room from the sidebar or create a new one to get started"
            userRole={userRole}
            onClick={() => setShowCreateRoom(true)}
            buttonText="Create a Room"
          />
        )}
      </div>
    </>
  );
};

export default RoomChat;