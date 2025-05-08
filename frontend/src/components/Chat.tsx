import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  User,
  Users,
  ArrowLeft,
  Search,
  X,
  Filter
} from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import defaultProfileImage from "../assets/images/default_user_img.jpg"; 
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Role configurations for theming
const roleConfigs: Record<string, any> = {
  admin: {
    theme: {
      primary: "red",
      colors: {
        bg: "bg-red-50",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        button: "bg-red-600 hover:bg-red-700",
      },
    },
  },
  donor: {
    theme: {
      primary: "green",
      colors: {
        bg: "bg-green-50",
        text: "text-green-700",
        hover: "hover:bg-green-100",
        button: "bg-green-600 hover:bg-green-700",
      },
    },
  },
  recipient: {
    theme: {
      primary: "blue",
      colors: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        button: "bg-blue-600 hover:bg-blue-700",
      },
    },
  },
  volunteer: {
    theme: {
      primary: "purple",
      colors: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
        button: "bg-purple-600 hover:bg-purple-700",
      },
    },
  },
};

interface ChatMessage {
  content: string;
  senderId: string;
  recipientId: string;
  type: "private";
  timestamp?: Date;
}

interface User {
  _id: string;
  id?: string;
  username: string;
  profileImage?: string;
  role?: keyof typeof roleConfigs;
}

const Chat: React.FC = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  // Helper to unify Mongo _id and OAuth id
  const getUserId = (u: any): string => u?._id || u?.id || "";

  const currentUserId = getUserId(user);

  // Read ?user= from URL
  const params = new URLSearchParams(search);
  const initialPartner = params.get("user") || "";

  const userRole = user?.role || "recipient";
  const theme =
    roleConfigs[userRole]?.theme.colors ||
    roleConfigs.recipient.theme.colors;

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileUsers, setShowMobileUsers] = useState(true);
  
  // New state for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const availableRoles = Object.keys(roleConfigs);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter users based on search term and selected roles
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoles.length === 0 || (user.role && selectedRoles.includes(user.role));
    return matchesSearch && matchesRole;
  });

  // Toggle role selection
  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRoles([]);
  };

  // 1) Real-time incoming messages
  useEffect(() => {
    if (!socket) return;
    socket.emit("registerUser", currentUserId);

    const handleMessage = (msg: ChatMessage) => {
      if (
        (msg.senderId === getUserId(selectedUser) &&
          msg.recipientId === currentUserId) ||
        (msg.senderId === currentUserId &&
          msg.recipientId === getUserId(selectedUser))
      ) {
        setMessages((prev) => [
          ...prev,
          { ...msg, type: "private", timestamp: new Date() },
        ]);
      }
    };

    socket.on("privateMessage", handleMessage);
    return () => {
      socket.off("privateMessage", handleMessage);
    };
  }, [socket, selectedUser, currentUserId]);

  // 2) Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 3) Load users list (minus yourself)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        const list: User[] = Array.isArray(res.data)
          ? res.data
          : res.data.users;
        setUsers(list.filter((u) => getUserId(u) !== currentUserId));
      } catch (err) {
        console.error("❌ Failed to load users", err);
      }
    })();
  }, [currentUserId]);

  // 4) Auto-select partner from URL
  useEffect(() => {
    if (initialPartner && users.length) {
      const partner = users.find(
        (u) => getUserId(u) === initialPartner
      );
      if (partner) selectUser(partner);
    }
  }, [initialPartner, users]);

  // Load private chat history
  const loadHistory = async (partnerId: string) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/private/${partnerId}/${currentUserId}`
      );
      const loaded: ChatMessage[] = res.data.map((m: any) => ({
        content: m.content,
        senderId: getUserId(m.sender),
        recipientId: getUserId(m.recipient),
        type: "private",
        timestamp: new Date(m.createdAt),
      }));
      setMessages(loaded);
    } catch (err) {
      console.error("❌ Failed to load messages", err);
    }
  };

  // When user clicks a contact
  const selectUser = (u: User) => {
    setSelectedUser(u);
    loadHistory(getUserId(u));
    setShowMobileUsers(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Send a new message
  const sendMessage = () => {
    if (!socket || !selectedUser || !message.trim()) return;
    const payload = {
      recipientId: getUserId(selectedUser),
      content: message,
      senderId: currentUserId,
    };
    socket.emit("privateMessage", payload);

    // echo in UI immediately
    setMessages((prev) => [
      ...prev,
      { ...payload, type: "private", timestamp: new Date() },
    ]);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts?: Date) =>
    ts
      ? new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(ts))
      : "";

  const getMessageDay = (ts?: Date) => {
    if (!ts) return "";
    const d = new Date(ts),
      today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    today.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Yesterday";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(d);
  };

  const renderAvatar = (u: User | null, size: 'sm'|'md'|'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
    const className = `${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden`;
  
    if (!u) return null;
  
    if (u.profileImage) {
      // Build a proper src URL:
      let src = u.profileImage.startsWith('http')
        ? u.profileImage
        : `http://localhost:5000${u.profileImage}`;
      // Cache-bust
      src += `?t=${Date.now()}`;
  
      return (
        <div className={className}>
          <img
            src={src}
            alt={u.username}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultProfileImage;
            }}
          />
        </div>
      );
    }
  
    // fallback to initial letter
    const userTheme = roleConfigs[u.role || 'recipient'].theme.colors;
    return (
      <div className={`${className} ${userTheme.bg} ${userTheme.text} uppercase font-bold`}>
        {u.username.charAt(0)}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col rounded-xl shadow-2xl bg-white overflow-hidden h-screen border border-gray-100 w-full transition-all duration-300">
      {/* Header */}
      <div
        className={`flex justify-between items-center px-6 py-4 ${theme.button} text-white`}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />{" "}
          {selectedUser ? selectedUser.username : "Messages"}
        </h2>
        <div className="flex items-center space-x-2">
          {renderAvatar(user as User)}
          <div className="text-sm">{user?.username || "Not logged in"}</div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            selectedUser && !showMobileUsers ? "hidden md:flex" : "flex"
          } w-full md:w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex-col transition-all duration-300`}
        >
          {/* Search and Filter Section */}
          <div className="p-4 space-y-3 border-b border-gray-200 bg-white">
            <div className="relative flex items-center">
              <Users className={`h-5 w-5 ${theme.text} mr-2`} />
              <h3 className="font-medium text-gray-700">Contacts</h3>
              <div className={`ml-auto px-2 py-1 ${theme.bg} ${theme.text} text-xs rounded-full`}>
                {filteredUsers.length}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
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

            {/* Role Filters */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin">
              <Filter className="h-3 w-3 text-gray-500 mr-1 flex-shrink-0" />
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.includes(role);
                const roleTheme = roleConfigs[role].theme.colors;
                
                return (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`
                      px-2 py-1 text-xs rounded-full whitespace-nowrap 
                      transition-all duration-200 transform
                      ${isSelected 
                        ? `${roleTheme.button} text-white` 
                        : `border ${roleTheme.bg} ${roleTheme.text}`
                      }
                      ${isSelected ? 'scale-105' : 'scale-100'}
                    `}
                  >
                    <span className="capitalize">{role}</span>
                  </button>
                );
              })}
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedRoles.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center transition-colors duration-200"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </button>
            )}
          </div>

          {/* Users List */}
          <div className="overflow-y-auto flex-1 pt-2">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-sm text-gray-500 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">No matches found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={getUserId(u)}
                  onClick={() => selectUser(u)}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${
                    getUserId(selectedUser) === getUserId(u)
                      ? `${theme.bg} border-l-4 ${theme.button} border-opacity-70`
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  {renderAvatar(u)}
                  <div className="ml-3 flex-1">
                    <div
                      className={`font-medium ${
                        getUserId(selectedUser) === getUserId(u)
                          ? theme.text
                          : "text-gray-800"
                      }`}
                    >
                      {u.username}
                    </div>
                    <div className="text-xs flex items-center">
                      {u.role && (
                        <span 
                          className={`mr-2 px-1.5 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                            roleConfigs[u.role].theme.colors.bg
                          } ${roleConfigs[u.role].theme.colors.text}`}
                        >
                          {u.role}
                        </span>
                      )}
                      <span className="text-gray-500">
                        {getUserId(selectedUser) === getUserId(u)
                          ? "Active conversation"
                          : "Tap to chat"}
                      </span>
                    </div>
                  </div>
                  {getUserId(selectedUser) === getUserId(u) && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`${
            !selectedUser && !showMobileUsers ? "hidden" : "flex"
          } flex-1 flex flex-col bg-white transition-all duration-300`}
        >
          {selectedUser ? (
            <>
              <div className="px-6 py-3 border-b border-gray-200 flex items-center bg-white sticky top-0 z-10">
                <button
                  className="md:hidden mr-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  onClick={() => setShowMobileUsers(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                {renderAvatar(selectedUser)}

                <div className="ml-3">
                  <div className="font-medium text-gray-800">
                    {selectedUser.username}
                  </div>
                  <div className="text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                    <span className="text-green-600">Online</span>
                  </div>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div
                      className={`w-20 h-20 rounded-full ${theme.bg} flex items-center justify-center mb-4`}
                    >
                      <MessageCircle
                        className={`h-10 w-10 ${theme.text}`}
                      />
                    </div>
                    <p className="font-medium text-gray-600">
                      No messages yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1 text-center">
                      Send a message to start chatting with{" "}
                      {selectedUser.username}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      let currentDay = "";
                      return messages.map((msg, idx) => {
                        const isUser = msg.senderId === currentUserId;
                        const messageDay = getMessageDay(msg.timestamp);
                        const showDayDivider =
                          messageDay !== currentDay;

                        if (showDayDivider) {
                          currentDay = messageDay;
                          return (
                            <React.Fragment key={idx}>
                              <div className="flex items-center justify-center my-4">
                                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                  {messageDay}
                                </div>
                              </div>
                              <div
                                className={`flex ${
                                  isUser
                                    ? "justify-end"
                                    : "justify-start"
                                } group items-end`}
                              >
                                {!isUser && (
                                  <div className="mr-2 flex-shrink-0">
                                    {renderAvatar(
                                      selectedUser,
                                      "sm"
                                    )}
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
                                {isUser && (
                                  <div className="ml-2 flex-shrink-0">
                                    {renderAvatar(user as User, "sm")}
                                  </div>
                                )}
                              </div>
                            </React.Fragment>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex ${
                              isUser ? "justify-end" : "justify-start"
                            } group items-end`}
                          >
                            {!isUser && (
                              <div className="mr-2 flex-shrink-0">
                                {renderAvatar(
                                  selectedUser,
                                  "sm"
                                )}
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
                            {isUser && (
                              <div className="ml-2 flex-shrink-0">
                                {renderAvatar(user as User, "sm")}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
                {isTyping && (
                  <div className="flex justify-start items-end">
                    {renderAvatar(selectedUser, "sm")}
                    <div className="bg-white border border-gray-200 ml-2 px-4 py-2 rounded-xl text-sm text-gray-500 shadow-sm">
                      <div className="flex space-x-1 items-center">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center relative">
                  <input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border border-gray-300 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 bg-gray-50 hover:bg-white"
                    style={{
                      focusRing: theme.text.replace("text-", ""),
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className={`absolute right-3 p-2 rounded-full transition-all duration-300 ${
                      message.trim()
                        ? `${theme.button} text-white scale-100 hover:scale-105 hover:shadow-md`
                        : "bg-gray-200 text-gray-400 cursor-not-allowed scale-90"
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white text-gray-500">
              <div className={`${theme.bg} rounded-full p-6 mb-5`}>
                <MessageCircle className={`h-10 w-10 ${theme.text}`} />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-center max-w-xs text-gray-500">
                Select a contact from the sidebar to start a conversation
              </p>
              <button
                onClick={() => setShowMobileUsers(true)}
                className={`mt-6 px-5 py-2 ${theme.button} text-white rounded-full transition-colors md:hidden flex items-center`}
              >
                <Users className="h-4 w-4 mr-2" />
                Show Contacts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;