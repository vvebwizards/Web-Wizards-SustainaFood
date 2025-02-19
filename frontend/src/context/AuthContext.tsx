import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // ✅ Import js-cookie

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null | undefined;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (userId: string, username: string, email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const storedUser = Cookies.get("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.data.requiresTwoFactor) {
        window.location.href = "/2fa";
        return;
      }

      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      setUser(response.data.user);
    } catch (error) {
      console.error("❌ Login Failed:", error);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string, role: string) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/signup",
        { username, email, password, role },
        { withCredentials: true }
      );

      const response = await axios.get("http://localhost:5000/api/auth/me", { withCredentials: true });
      setUser(response.data.user);
      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
    } catch (error) {
      console.error("❌ Signup Failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

      setUser(null);
      Cookies.remove("user");
      Cookies.remove("token");

      console.log("✅ Logout successful, user and token removed.");
    } catch (error) {
      console.error("❌ Logout Failed:", error);
    }
  };

  // ✅ UPDATE USER INFO FUNCTION
  const updateUserInfo = async (userId: string, username: string, email: string, password: string) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/update/${userId}`,
        { username, email, password },
        { withCredentials: true }
      );
      console.log("✅ User info updated:", response.data);

      // ✅ Store updated user in state and cookies
      if (response.data.user) {
        setUser(response.data.user);
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      }
    } catch (error: any) {
      console.error("❌ Update User Info Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await axios.post("http://localhost:5000/api/auth/request-reset", { email });
      console.log("📧 Password reset request sent.");
    } catch (error) {
      console.error("❌ Password Reset Request Failed:", error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { token, newPassword });
      console.log("🔑 Password reset successful.");
    } catch (error) {
      console.error("❌ Password Reset Failed:", error);
      throw error;
    }
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-2fa",
        { code }
      );

      console.log("✅ 2FA Verified:", response.data);
      setUser(response.data.user);
      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
    } catch (error) {
      console.error("❌ 2FA Verification Failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateUserInfo,
      requestPasswordReset, 
      resetPassword, 
      verifyTwoFactor 
    }}>
      {user !== undefined && children} {/* ✅ Ensures authentication check completes before rendering */}
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
