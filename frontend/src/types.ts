export interface User {
    _id: string;
    id?: string;
    username: string;
    profileImage?: string;
    role?: string;
  }
  
  export interface ChatMessage {
    content: string;
    senderId: string;
    recipientId?: string;
    roomId?: string;
    type: "private" | "room";
    timestamp?: Date;
  }
  
  export interface Room {
    _id: string;
    name: string;
    description: string;
    createdBy: string;
    isPrivate: boolean;
    members: string[];
    createdAt: Date;
    updatedAt: Date;
    lastMessage?: {
      content: string;
      senderId: string;
      timestamp: Date;
    };
  }