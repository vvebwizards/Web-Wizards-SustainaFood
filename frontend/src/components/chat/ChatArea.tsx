import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Info, X, UserPlus } from 'lucide-react';
import { Room, User, ChatMessage } from "../../types";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import RoomHeader from "./RoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./RoomMessageInput";
import { getUserId } from "../../utils/chatHelpers";

interface ChatAreaProps {
  selectedRoom: Room;
  setShowMobileRoomList: (show: boolean) => void;
  currentUserId: string;
  theme: any;
  userRole: string;
  user: User;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedRoom,
  setShowMobileRoomList,
  currentUserId,
  theme,
  userRole,
  user
}) => {
  const socket = useSocket();
  const [roomMembers, setRoomMembers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch history from correct endpoint, bust cache with timestamp
  useEffect(() => {
    if (!selectedRoom?._id) return;
    const fetchHistory = async () => {
      const url = `https://foodreduce-backend.azurewebsites.net/api/chat/rooms/${selectedRoom._id}/messages?t=${Date.now()}`;
      console.log('🔄 Fetching history from', url);
      try {
        const res = await axios.get(url, { params: { t: Date.now() } });
        console.log('✅ History data:', res.data);
        const loaded: ChatMessage[] = res.data.map((m: any) => ({
          content:   m.content,
          senderId:  typeof m.sender === 'string' ? m.sender : m.sender._id,
          roomId:    typeof m.room   === 'string' ? m.room   : m.room.toString(),
          type:      'room',
          timestamp: new Date(m.createdAt)
        }));
        setMessages(loaded);
      } catch (err: any) {
        console.error('❌ Error loading history:', err.response?.data || err.message);
        setMessages([]);
      }
    };

    fetchHistory();
    // join socket room
    console.log('🔗 Joining socket room', selectedRoom._id);
    socket.emit('joinRoom', { roomId: selectedRoom._id, userId: currentUserId });
    // focus
    inputRef.current?.focus();
  }, [selectedRoom._id]);

  // 2. Fetch members
  useEffect(() => {
    if (!selectedRoom?._id) return;
    (async () => {
      try {
        const url = `https://foodreduce-backend.azurewebsites.net/api/chat/rooms/${selectedRoom._id}/members`;
        console.log('🔄 Fetching members from', url);
        const res = await axios.get(url, { params: { t: Date.now() } });
        setRoomMembers(res.data);
      } catch (err) {
        console.error('❌ Error loading members:', err);
        setRoomMembers([]);
      }
    })();
  }, [selectedRoom._id]);

  // 3. Handle incoming real-time messages
  useEffect(() => {
    const handler = (msg: any) => {
      const rid = msg.roomId || msg.room;
      if (rid !== selectedRoom._id) return;
      const sid = msg.senderId || msg.sender;
      if (sid === currentUserId) return; // skip own
      setMessages(prev => [
        ...prev,
        {
          content:   msg.content,
          senderId:  sid,
          roomId:    rid,
          type:      'room',
          timestamp: new Date(msg.createdAt || Date.now())
        }
      ]);
    };
    socket.on('newMessage', handler);
    return () => { socket.off('newMessage', handler); };
  }, [socket, selectedRoom._id, currentUserId]);

  // 4. Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const isRoomMember = () => selectedRoom.members.includes(currentUserId);

  const joinRoom = async () => {
    await axios.post(`/api/chat/rooms/${selectedRoom._id}/join`, { userId: currentUserId });
    setRoomMembers(prev => [...prev, user]);
    socket.emit('joinRoom', { roomId: selectedRoom._id, userId: currentUserId });
  };

  const leaveRoom = async () => {
    await axios.post(`/api/chat/rooms/${selectedRoom._id}/leave`, { userId: currentUserId });
    setRoomMembers(prev => prev.filter(m => getUserId(m) !== currentUserId));
    socket.emit('leaveRoom', { roomId: selectedRoom._id, userId: currentUserId });
  };

  const sendMessage = () => {
    if (!message.trim() || !isRoomMember()) return;
    const payload = { content: message.trim(), senderId: currentUserId, roomId: selectedRoom._id };
    // Local echo
    setMessages(prev => [...prev, { ...payload, type: 'room', timestamp: new Date() }]);
    socket.emit('sendMessage', payload);
    setMessage('');
  };

  return (
    <>
      <RoomHeader
        selectedRoom={selectedRoom}
        setShowMobileRoomList={setShowMobileRoomList}
        isRoomMember={isRoomMember()}
        joinRoom={joinRoom}
        leaveRoom={leaveRoom}
        roomMembers={roomMembers}
        theme={theme}
        currentUserId={currentUserId}
      />
      <MessageList
        messages={messages}
        roomMembers={roomMembers}
        currentUserId={currentUserId}
        userRole={userRole}
        user={user}
        scrollRef={scrollRef}
        theme={theme}
      />
      <MessageInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isRoomMember={isRoomMember()}
        joinRoom={joinRoom}
        selectedRoom={selectedRoom}
        inputRef={inputRef}
        theme={theme}
      />
    </>
  );
};

export default ChatArea;
