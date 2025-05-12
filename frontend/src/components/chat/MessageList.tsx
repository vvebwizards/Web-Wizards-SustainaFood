import React from 'react';
import { ChatMessage, User as UserType } from "../../types.ts";
import { formatTime, getMessageDay, getUserId } from "../../utils/chatHelpers";
import EmptyState from "./EmptyState";
import UserAvatar from "./UserAvatar";

interface MessageListProps {
  messages: ChatMessage[];
  roomMembers: UserType[];
  currentUserId: string;
  userRole: string;
  user: any;
  scrollRef: React.RefObject<HTMLDivElement>;
  theme: any;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  roomMembers,
  currentUserId,
  userRole,
  user,
  scrollRef,
  theme
}) => {
  const getMemberName = (memberId: string): string => {
    const member = roomMembers.find(m => getUserId(m) === memberId);
    return member ? member.username : "Unknown User";
  };

  return (
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
            return messages.flatMap((msg, idx) => {
              const isUser = msg.senderId === currentUserId;
              const messageDay = getMessageDay(msg.timestamp);
              const showDayDivider = messageDay !== currentDay;
              currentDay = messageDay;

              const sender = roomMembers.find(m => getUserId(m) === msg.senderId) || null;

              const items = [];

              if (showDayDivider) {
                items.push(
                  <div key={`day-${idx}`} className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {messageDay}
                    </div>
                  </div>
                );
              }

              items.push(
                <div
                  key={idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} group items-end`}
                >
                  {!isUser && (
                    <div className="mr-2 flex-shrink-0">
                      <UserAvatar user={sender} size="sm" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[75%]">
                    {!isUser && (
                      <div className="text-xs text-gray-500 mb-1 ml-1">
                        {sender?.username || "Unknown user"}
                      </div>
                    )}

                    <div
                      className={`
                        px-4 py-2 rounded-2xl shadow-sm
                        ${isUser
                          ? `${theme.button} text-white rounded-br-none`
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}
                        transform transition-all duration-200 hover:scale-[1.01] group-hover:shadow-md
                      `}
                    >
                      <div className="whitespace-normal break-keep overflow-x-auto">
                        {msg.content}
                      </div>
                      <div
                        className={`text-[10px] text-right mt-1 ${
                          isUser ? 'text-white/70' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>

                  {isUser && (
                    <div className="ml-2 flex-shrink-0">
                      <UserAvatar user={user as UserType} size="sm" />
                    </div>
                  )}
                </div>
              );

              return items;
            });
          })()}
        </div>
      )}
    </div>
  );
};

export default MessageList;
