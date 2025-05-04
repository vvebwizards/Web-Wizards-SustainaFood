import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

// Function to calculate level and XP to next level
const calculateLevel = (points: number) => {
  const levelThresholds = [500, 1000, 1500, 2000, 5000]; // XP required for each level
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

  // For levels beyond the thresholds, 5000 XP is required for each level
  const xpToNextLevel = 5000 - (remainingXP % 5000);
  level += Math.floor(remainingXP / 5000);

  return { level, xpToNextLevel };
};

export function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`, {
        withCredentials: true,
      });
      const sortedUsers = response.data.users.sort((a: any, b: any) => b.points - a.points);
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const connectedUser = users.find((userItem) => userItem.username === user.username);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="mt-7 text-2xl font-semibold">Leaderboard</h2>
      </div>

      {/* User Profile Section */}
      {connectedUser && (
        <div className="flex items-center bg-white rounded-xl shadow-sm p-6 mb-6">
          <img
            className="h-20 w-20 rounded-full"
            src={getProfileImageUrl(connectedUser.profileImage)}
            alt={connectedUser.username}
          />
          <div className="ml-12">
            <div className="text-xl font-semibold text-gray-900">{connectedUser.username}</div>
            <div className="text-lg text-gray-600">XP: {connectedUser.points}</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{
                  width: `${(() => {
                    const { level, xpToNextLevel } = calculateLevel(connectedUser.points);
                    const totalXPForCurrentLevel = level < 5 ? [500, 1000, 1500, 2000, 5000][level] : 5000;
                    const currentLevelXP = totalXPForCurrentLevel - xpToNextLevel; // XP earned in the current level
                    const progressPercentage = (currentLevelXP / totalXPForCurrentLevel) * 100;
                    return Math.min(progressPercentage, 100); // Cap the width at 100%
                  })()}%`,
                }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {(() => {
                const { level, xpToNextLevel } = calculateLevel(connectedUser.points);
                return `Level ${level} (${xpToNextLevel} XP to next level)`;
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={handleSortByPoints}
              >
                Experience Points (XP)
                {sortOrder === "asc" ? " ↑" : " ↓"}
              </th>
            </tr>
          </thead>
        <tbody className="divide-y divide-gray-200">
        {users.map((userItem, index) => (
        <tr
        key={userItem._id}
        className={`hover:bg-gray-100 transition duration-200 ${
        user.username === userItem.username ? "bg-blue-300" : ""
        }`}
        >
        <td className="px-6 py-4 whitespace-nowrap">
        {index + 1}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
        <img
            className="h-10 w-10 rounded-full"
            src={getProfileImageUrl(userItem.profileImage)}
            alt={userItem.username}
        />
        <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
            {userItem.username}
            </div>
        </div>
        </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
        {userItem.points}
        </td>
        </tr>
        ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;