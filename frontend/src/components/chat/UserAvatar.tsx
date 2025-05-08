import React from "react";
import { User } from "../../types";
import { roleConfigs } from "../../utils/roleConfigs";

// This would be imported from your assets
const defaultProfileImage = "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=300";

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  const className = `${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden`;

  if (!user) return null;

  if (user.profileImage) {
    // Build a proper src URL:
    let src = user.profileImage.startsWith('http')
      ? user.profileImage
      : `http://localhost:5000${user.profileImage}`;
    // Cache-bust
    src += `?t=${Date.now()}`;

    return (
      <div className={className}>
        <img
          src={src}
          alt={user.username}
          className="object-cover w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultProfileImage;
          }}
        />
      </div>
    );
  }

  // fallback to initial letter
  const userTheme = roleConfigs[user.role || 'recipient'].theme.colors;
  return (
    <div className={`${className} ${userTheme.bg} ${userTheme.text} uppercase font-bold`}>
      {user.username.charAt(0)}
    </div>
  );
};

export default UserAvatar;