import React, { useState } from "react";
import { Ban, Eye, Trash2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { UserDetailsModal } from "../components/UserDetailsModal";

export function UserManagement() {
  const { users, blockUser, deleteUser } = useAdmin();

  // State for modal: selected user and modal open/close
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Users Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleViewDetails(user)} className="text-gray-600 hover:text-gray-900">
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => blockUser(user.id)}
                      className={`${user.status === "Active" ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                    >
                      <Ban size={18} />
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render the modal when showDetails is true */}
      {showDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onBlock={(id) => {
            blockUser(id);
            setShowDetails(false);
          }}
        />
      )}
    </div>
  );
}

export default UserManagement;
