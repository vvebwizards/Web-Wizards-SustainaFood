import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, CheckCircle } from "lucide-react";

const InviteModal = ({ roomId, currentUserId, onClose, theme, roomMembers }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/chat/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const inviteUser = async (toUsername) => {
    setLoading(true);
    try {
      await axios.post(`/api/chat/rooms/${roomId}/invite`, {
        fromUserId: currentUserId,
        toUsername,
      });
      setMessage(`✅ Invitation sent to ${toUsername}!`);
    } catch (err) {
      console.error("Failed to send invite", err);
      setMessage("❌ Failed to send invite");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000); // clear message after 3 sec
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Invite Users</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {message && (
          <div className="mb-3 text-sm text-center font-medium">
            <span className={message.startsWith("✅") ? "text-green-600" : "text-red-600"}>
              {message}
            </span>
          </div>
        )}

        <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200">
          {users
            .filter((u) => u._id !== currentUserId)
            .map((user) => {
              const isMember = roomMembers.some((m) => m._id === user._id);
              return (
                <li key={user._id} className="flex justify-between items-center py-2">
                  <div className="flex items-center space-x-2">
                    <span>{user.username}</span>
                    {isMember && (
                      <CheckCircle className="h-4 w-4 text-green-500" title="Already in room" />
                    )}
                  </div>
                  <button
                    disabled={loading || isMember}
                    onClick={() => inviteUser(user.username)}
                    className={`px-2 py-1 rounded text-xs ${
                      isMember
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : `${theme.button} text-white`
                    }`}
                  >
                    {isMember ? "Member" : "Invite"}
                  </button>
                </li>
              );
            })}
        </ul>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-center text-sm text-gray-600 hover:text-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InviteModal;
