import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  signup: (username: string, email: string, password: string, role: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const signup = async (username: string, email: string, password: string, role: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        username,
        email,
        password,
        role,
      });

      console.log("✅ Signup Successful:", response.data);
      setUser(response.data.user); // Update user state after signup
      return response.data;
    } catch (error: any) {
      console.error("❌ Signup Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  return <AuthContext.Provider value={{ user, signup }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
