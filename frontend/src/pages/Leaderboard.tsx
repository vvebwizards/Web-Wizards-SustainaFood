import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Default to "desc"

  // Fetch users from the backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`, {
        withCredentials: true,
      });
      const sortedUsers = response.data.users.sort((a: any, b: any) => b.points - a.points); // Sort descending by default
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle sorting users by points
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

  // Helper to get the full image URL
  const getProfileImageUrl = (profileImage: string) => {
    if (profileImage && profileImage.trim() !== "") {
      return profileImage.startsWith("/")
        ? BASE_URL + profileImage
        : profileImage;
    }
    return "https://via.placeholder.com/40";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="mt-7 text-2xl font-semibold">Leaderboard</h2>
      </div>

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