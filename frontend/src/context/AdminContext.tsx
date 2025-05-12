import React, { createContext, useState, useEffect, useContext } from "react";

// Define the shape of a User (adjust to your real data)
type User = {
  id: number;
  name: string;
  email: string;
  status: string;
  role: string;
  lastActive: string;
  avatar: string;
};

// Define what the context will provide
type AdminContextProps = {
  users: User[];
  fetchUsers: () => Promise<void>;
  blockUser: (userId: number) => void;
  deleteUser: (userId: number) => void;
};

// Create the context (default undefined so we can ensure usage inside provider)
const AdminContext = createContext<AdminContextProps | undefined>(undefined);

// The Provider component
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  // Example: fetch users from your API or use a local array
  const fetchUsers = async () => {
    // For demonstration, we can use a local array
    // In a real app, you'd fetch from an API endpoint:
    // const response = await fetch("/api/users");
    // const data = await response.json();
    // setUsers(data);
    const initialUsers: User[] = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        status: "Active",
        role: "User",
        lastActive: "2 hours ago",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        status: "Blocked",
        role: "Admin",
        lastActive: "1 day ago",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        status: "Active",
        role: "User",
        lastActive: "3 days ago",
        avatar:
          "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 4,
        name: "Sarah Wilson",
        email: "sarah@example.com",
        status: "Active",
        role: "User",
        lastActive: "1 week ago",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ];
    setUsers(initialUsers);
  };

  // Block or unblock a user
  const blockUser = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "Active" ? "Blocked" : "Active" }
          : user
      )
    );
  };

  // Delete a user
  const deleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  // Fetch users once on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminContext.Provider value={{ users, fetchUsers, blockUser, deleteUser }}>
      {children}
    </AdminContext.Provider>
  );
};

// Helper hook for easy usage in components
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
