import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Users, ChevronUp, ChevronDown, Award, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  profileImage: string;
  points: number;
}

const BASE_URL = "http://localhost:5000";

const calculateLevel = (points: number) => {
  const levelThresholds = [500, 1000, 1500, 2000, 5000];
  let level = 0;
  let remainingXP = points;

  for (let i = 0; i < levelThresholds.length; i++) {
    if (remainingXP >= levelThresholds[i]) {
      remainingXP -= levelThresholds[i];
      level++;
    } else {
      return { level, xpToNextLevel: levelThresholds[i] - remainingXP };
    }
  }

  const xpToNextLevel = 5000 - (remainingXP % 5000);
  level += Math.floor(remainingXP / 5000);

  return { level, xpToNextLevel };
};

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/users`, {
        withCredentials: true,
      });
      const sortedUsers = response.data.users.sort((a: User, b: User) => b.points - a.points);
      setUsers(sortedUsers);
      
      // Find current user
      const connectedUser = sortedUsers.find((userItem: User) => userItem.username === user.username);
      setCurrentUser(connectedUser || null);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSortByPoints = () => {
    const sortedUsers = [...users].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.points - b.points;
      } else {
        return b.points - a.points;
      }
    });
    setUsers(sortedUsers);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getProfileImageUrl = (profileImage: string) => {
    if (profileImage && profileImage.trim() !== "") {
      return profileImage.startsWith("/")
        ? BASE_URL + profileImage
        : profileImage;
    }
    return "https://via.placeholder.com/40";
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-gray-500 font-medium">{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="animate-pulse min-h-[400px] bg-white rounded-xl shadow-sm p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
          <Users size={16} />
          <span className="text-sm font-medium">{users.length} Participants</span>
        </div>
      </div>

      {currentUser && (
        <div className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-t-xl p-6 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-12 -mr-12 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -mb-8 -ml-8 pointer-events-none"></div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-200" />
              Your Progress
            </h3>
            
            <div className="flex items-start">
              <div className="relative">
                <img
                  className="h-20 w-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  src={getProfileImageUrl(currentUser.profileImage)}
                  alt={currentUser.username}
                />
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
                  <Award className="w-4 h-4 text-indigo-800" />
                </div>
              </div>
              
              <div className="ml-6 flex-1">
                <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="font-semibold">{currentUser.points.toLocaleString()} XP</span>
                  </div>
                  <div className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                    Level {calculateLevel(currentUser.points).level}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-b-xl shadow-sm p-6 border border-gray-100 border-t-0">
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">
                Level {calculateLevel(currentUser.points).level}
              </div>
              <div className="text-sm font-medium text-gray-500">
                Level {calculateLevel(currentUser.points).level + 1}
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(() => {
                    const { level, xpToNextLevel } = calculateLevel(currentUser.points);
                    const totalXPForCurrentLevel = level < 5 ? [500, 1000, 1500, 2000, 5000][level] : 5000;
                    const currentLevelXP = totalXPForCurrentLevel - xpToNextLevel;
                    const progressPercentage = (currentLevelXP / totalXPForCurrentLevel) * 100;
                    return Math.min(progressPercentage, 100);
                  })()}%` }}
                ></div>
              </div>
              
              <div className="absolute left-0 -mt-1 w-full flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => {
                  const position = (i / 4) * 100;
                  const { level, xpToNextLevel } = calculateLevel(currentUser.points);
                  const totalXPForCurrentLevel = level < 5 ? [500, 1000, 1500, 2000, 5000][level] : 5000;
                  const currentLevelXP = totalXPForCurrentLevel - xpToNextLevel;
                  const progressPercentage = (currentLevelXP / totalXPForCurrentLevel) * 100;
                  const isMilestone = position <= progressPercentage;
                  return (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full transform -translate-x-1/2 transition-all ${
                        isMilestone ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                      style={{ left: `${position}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                {(() => {
                  const { level, xpToNextLevel } = calculateLevel(currentUser.points);
                  const totalXPForCurrentLevel = level < 5 ? [500, 1000, 1500, 2000, 5000][level] : 5000;
                  const currentLevelXP = totalXPForCurrentLevel - xpToNextLevel;
                  return `${currentLevelXP.toLocaleString()} XP earned in Level ${level}`;
                })()}
              </div>
              <div className="flex items-center gap-1 text-indigo-600 font-medium text-sm">
                <Zap className="w-4 h-4" />
                <span>
                  {calculateLevel(currentUser.points).xpToNextLevel.toLocaleString()} XP to Level {calculateLevel(currentUser.points).level + 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th 
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer group"
                  onClick={handleSortByPoints}
                >
                  <div className="flex items-center gap-1">
                    <span>Experience Points</span>
                    <div className="transition-transform duration-200 group-hover:text-indigo-600">
                      {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((userItem, index) => {
                const isCurrentUser = user && user.username === userItem.username;
                const { level } = calculateLevel(userItem.points);
                
                return (
                  <tr
                    key={userItem._id}
                    className={`transition-all duration-300 hover:bg-indigo-50 ${
                      isCurrentUser 
                        ? "bg-indigo-100 hover:bg-indigo-200" 
                        : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center w-8 h-8 bg-white rounded-full items-center shadow-sm">
                        {getRankBadge(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            className={`h-10 w-10 rounded-full object-cover border-2 ${
                              isCurrentUser ? "border-indigo-500" : "border-gray-200"
                            }`}
                            src={getProfileImageUrl(userItem.profileImage)}
                            alt={userItem.username}
                          />
                          {isCurrentUser && (
                            <div className="absolute -top-1 -right-1 bg-indigo-600 rounded-full w-4 h-4 border border-white"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`font-medium ${isCurrentUser ? "text-indigo-700" : "text-gray-900"}`}>
                            {userItem.username}
                            {index < 3 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                Top {index + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-amber-500 mr-1" />
                        <span className="font-semibold">{userItem.points.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="px-2.5 py-1 bg-indigo-100 rounded-full text-xs font-semibold text-indigo-700 inline-block">
                        Level {level}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;