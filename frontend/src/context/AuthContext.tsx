import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token]);

  // ✅ LOGIN FUNCTION
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });

      console.log("✅ Login Success:", response.data);

      if (response.data.requiresTwoFactor) {
        window.location.href = "/2fa"; // Redirect to 2FA if required
        return;
      }

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      setUser(response.data.user);
      setToken(response.data.token);
    } catch (error: any) {
      console.error("❌ Login Failed:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  // ✅ SIGNUP FUNCTION
  const signup = async (username: string, email: string, password: string, role: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        username,
        email,
        password,
        role,
      });

      console.log("✅ Signup Success:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Signup Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    console.log("👋 Logging Out");
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ PASSWORD RESET REQUEST
  const requestPasswordReset = async (email: string) => {
    try {
      await axios.post("http://localhost:5000/api/auth/request-reset", { email });
      console.log("📧 Password reset request sent.");
    } catch (error: any) {
      console.error("❌ Password Reset Request Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ PASSWORD RESET FUNCTION
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { token, newPassword });
      console.log("🔑 Password reset successful.");
    } catch (error: any) {
      console.error("❌ Password Reset Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ VERIFY TWO-FACTOR AUTHENTICATION CODE
  const verifyTwoFactor = async (code: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-2fa", { code });

      console.log("✅ 2FA Verified:", response.data);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      setUser(response.data.user);
      setToken(response.data.token);
    } catch (error: any) {
      console.error("❌ 2FA Verification Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, requestPasswordReset, resetPassword, verifyTwoFactor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
