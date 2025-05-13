import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserId } from "../utils/chatHelpers";

axios.defaults.withCredentials = true;

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
    const res = await fetch(
      `https://zealous-glacier-0b57ac403.6.azurestaticapps.net/api/auth/verify-email?token=${token}`,
      { method: "GET" }
    );
    const data = await res.json();
    console.log("🔍 Email verification response:", data);
    return res.ok;
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
        const res = await axios.get("https://foodreduce-backend.azurewebsites.net/api/auth/me", { withCredentials: true });
        if (res.data.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string, captchaToken: string) => {
    const res = await axios.post("https://foodreduce-backend.azurewebsites.net/api/auth/login", 
      {
        email,
        password,
        captchaToken,
      },
      { withCredentials: true }
    );
    const u: User = res.data.user;
    const uid = getUserId(u);

    if (u.twofa) {
      await sendOtp(uid);
      window.location.href = `/2fa?userId=${uid}`;
      return;
    }

    setUser(u);
    if (u.profileImage) {
      const imageUrl = `https://foodreduce-backend.azurewebsites.net${u.profileImage}?t=${Date.now()}`;
      localStorage.setItem("profileImage", imageUrl);
    }
  };

  const signup = async (username: string, email: string, password: string, role: string) => {
    const res = await axios.post("https://foodreduce-backend.azurewebsites.net/api/auth/signup",
      {
        username,
        email,
        password,
        role,
      },
      { withCredentials: true }
    );
    window.location.href = `/verify-email?email=${email}`;
    return res.data;
  };

  const logout = async () => {
    await axios.post("https://foodreduce-backend.azurewebsites.net/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
    localStorage.removeItem("profileImage");
  };

  const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    try {
      await axios.put(`https://foodreduce-backend.azurewebsites.net/api/users/update-password/${userId}`,
        {
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
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

  const res = await axios.put(
    `https://foodreduce-backend.azurewebsites.net/api/auth/update/${resolvedUserId}`,
    form,
    { withCredentials: true }
  );
  setUser(res.data.user);
};

  const sendOtp = async (userId: string) => {
    await axios.post(
      `https://foodreduce-backend.azurewebsites.net/api/auth/send-otp/${userId}`,
      {},
      { withCredentials: true }
    );
  };

  const verifyTwoFactor = async (userId: string, code: string) => {
    const res = await axios.post(
      `https://foodreduce-backend.azurewebsites.net/api/auth/verify-2fa/${userId}`,
      { code },
      { withCredentials: true }
    );
    setUser(res.data.user);
  };

  const updateTwoFaStatus = async (userId: string, status: boolean, code: string) => {
    await axios.post(
      `https://foodreduce-backend.azurewebsites.net/api/auth/updatetwofa/${userId}`,
      { twofa: status, code },
      { withCredentials: true }
    );
    toast.success("2FA status updated successfully");
  };

  const requestPasswordReset = async (email: string) => {
    await axios.post(
      "https://foodreduce-backend.azurewebsites.net/api/auth/request-reset",
      { email },
      { withCredentials: true }
    );
    toast.success("Password reset email sent!");
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await axios.post(
      "https://foodreduce-backend.azurewebsites.net/api/auth/reset-password",
      { token, newPassword },
      { withCredentials: true }
    );
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
