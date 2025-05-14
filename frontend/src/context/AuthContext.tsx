import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import axiosInstance from "../services/axiosConfig";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserId } from "../utils/chatHelpers";

interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: string;
  profileImage: string;
  twofa: boolean;
  points: number;
  lastSpinDate?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, captchaToken: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyTwoFactor: (userId: string, code: string) => Promise<void>;
  updateUserInfo: (userId: string, username: string, profileImage: File | null) => Promise<void>;
  sendOtp: (userId: string) => Promise<void>;
  updateTwoFaStatus: (userId: string, status: boolean, code: string) => Promise<void>;
  setUser: (user: User | null) => void;
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const verifyEmail = async (token: string) => {
  try {
    const res = await axiosInstance.get(
      `/auth/verify-email?token=${token}`
    );
    console.log("🔍 Email verification response:", res.data);
    return res.status === 200;
  } catch (error) {
    console.error("❌ Email verification error:", error);
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (u: User | null) => {
    _setUser(u);
    if (u) {
      Cookies.set("user", JSON.stringify(u), { expires: 7 });
      Cookies.set("points", (u.points ?? 0).toString());
    } else {
      Cookies.remove("user");
      Cookies.remove("points");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      // Check for token first
      const token = localStorage.getItem('token') || Cookies.get('token');
      if (!token) {
        console.log('🔍 No authentication token found');
        setUser(null);
        setLoading(false);
        return;
      }
      
      // If we have a token, set it to axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const stored = localStorage.getItem("user");
      const storedPoints = localStorage.getItem("points");

      if (stored) {
        const u: User = JSON.parse(stored);

        if (storedPoints && !isNaN(Number(storedPoints))) {
          u.points = Number(storedPoints);
        } else {
          u.points = 0;
        }

        setUser(u);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking session with backend');
        const res = await axiosInstance.get("/auth/me");
        if (res.data.user) {
          console.log('✅ Session verified, user loaded');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } else {
          console.log('⚠️ Session check returned no user');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string, captchaToken: string) => {
    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
        captchaToken,
      });
      
      // Save the token from the response
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        Cookies.set('token', res.data.token, { expires: 7 });
        console.log('📝 Token saved:', res.data.token);
      } else {
        console.warn('⚠️ No token received in login response');
      }
      
      const u: User = res.data.user;
      const uid = getUserId(u);

      if (u.twofa) {
        await sendOtp(uid);
        window.location.href = `/2fa?userId=${uid}`;
        return;
      }

      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      
      if (u.profileImage) {
        const imageUrl = `https://foodreduce-backend.azurewebsites.net${u.profileImage}?t=${Date.now()}`;
        localStorage.setItem("profileImage", imageUrl);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string, role: string) => {
    const res = await axiosInstance.post("/auth/signup", {
      username,
      email,
      password,
      role,
    });
    window.location.href = `/verify-email?email=${email}`;
    return res.data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      // Clear all auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('profileImage');
      Cookies.remove('token');
      Cookies.remove('user');
      console.log('🔒 User logged out and auth data cleared');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local data even if API call fails
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('profileImage');
      Cookies.remove('token');
      Cookies.remove('user');
    }
  };

  const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    try {
      let token = localStorage.getItem('token');
      if (!token && typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
        if (match) token = match[1];
      }
      await axiosInstance.put(
        `/users/update-password/${userId}`,
        { currentPassword, newPassword }
      );
      toast.success("Password updated successfully!");
    } catch {
      toast.error("Failed to update password. Please try again.");
    }
  };

const updateUserInfo = async (userId: string, username: string, profileImage: File | null) => {
  const resolvedUserId = userId === ":userId" ? getUserId(user) : userId;
  const form = new FormData();
  form.append("username", username);
  if (profileImage) form.append("profileImage", profileImage);

  const res = await axiosInstance.put(`/auth/update/${resolvedUserId}`, form);
  setUser(res.data.user);
};

  const sendOtp = async (userId: string) => {
    await axiosInstance.post(`/auth/send-otp/${userId}`);
  };

  const verifyTwoFactor = async (userId: string, code: string) => {
    const res = await axiosInstance.post(`/auth/verify-2fa/${userId}`, { code });
    setUser(res.data.user);
  };

  const updateTwoFaStatus = async (userId: string, status: boolean, code: string) => {
    await axiosInstance.post(`/auth/updatetwofa/${userId}`, { twofa: status, code });
    toast.success("2FA status updated successfully");
  };

  const requestPasswordReset = async (email: string) => {
    await axiosInstance.post("/auth/request-reset", { email });
    toast.success("Password reset email sent!");
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await axiosInstance.post("/auth/reset-password", { token, newPassword });
    toast.success("Password successfully changed!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updatePassword,
        updateUserInfo,
        sendOtp,
        verifyTwoFactor,
        updateTwoFaStatus,
        requestPasswordReset,
        resetPassword,
        setUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
