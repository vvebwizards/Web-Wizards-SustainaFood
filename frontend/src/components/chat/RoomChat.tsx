import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserId } from "../../utils/chatHelpers";
import { roleConfigs } from "../../utils/roleConfigs";
import { Room } from "../../types.ts";
import RoomList from "./RoomList";
import ChatArea from "./ChatArea";
import EmptyState from "./RoomEmptyState";

const RoomChat: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = getUserId(user);
  const userRole = user?.role || "recipient";
  const theme = roleConfigs[userRole]?.theme.colors || roleConfigs.recipient.theme.colors;
  
  // Shared state between components
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showMobileRoomList, setShowMobileRoomList] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  return (
    <>
      {/* Rooms List Sidebar */}
      <RoomList 
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        showMobileRoomList={showMobileRoomList}
        setShowMobileRoomList={setShowMobileRoomList}
        showCreateRoom={showCreateRoom}
        setShowCreateRoom={setShowCreateRoom}
        currentUserId={currentUserId}
        theme={theme}
      />
      
      {/* Chat Area */}
      <div
        className={`${
          !selectedRoom && !showMobileRoomList ? "hidden" : "flex"
        } flex-1 flex flex-col bg-white transition-all duration-300`}
      >
        {selectedRoom ? (
          <ChatArea 
            selectedRoom={selectedRoom}
            setShowMobileRoomList={setShowMobileRoomList}
            currentUserId={currentUserId}
            theme={theme}
            userRole={userRole}
            user={user}
          />
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