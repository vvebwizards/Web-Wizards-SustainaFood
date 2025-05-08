import React from 'react';
import { ArrowLeft, Info, X, UserPlus, Users, Lock } from "lucide-react";
import { Room, User } from "../../types";

interface RoomHeaderProps {
  selectedRoom: Room;
  setShowMobileRoomList: (show: boolean) => void;
  isRoomMember: boolean;
  joinRoom: () => void;
  leaveRoom: () => void;
  roomMembers: User[];
  theme: any;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  selectedRoom,
  setShowMobileRoomList,
  isRoomMember,
  joinRoom,
  leaveRoom,
  roomMembers,
  theme
}) => {
  return (
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
      

    </div>
  );
};

export default RoomHeader;