import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
axios.defaults.withCredentials = true;

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phoneNumber: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, captchaToken: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  updateUserInfo: (userId: string, username: string, email: string, password: string) => Promise<void>;
  updatePhoneNumber: (userId: string, phone: string) => Promise<void>;
  sendOtp: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Checking session...");
  
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });
  
        console.log("✅ Session restored:", response.data);
        setUser(response.data.user);
      } catch (error) {
        console.warn("⚠️ No active session found:", error.response?.data || error.message);
        setUser(null); // Make sure user state is explicitly set to null on failure
      }
    };
  
    checkSession();
  }, []);
  
  
  
  

  // ✅ LOGIN FUNCTION (Added Captcha Token)
  const login = async (email: string, password: string, captchaToken: string) => {
    try {
      console.log("📡 Sending login request:", { email, password, captchaToken });

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password, captchaToken },
        { withCredentials: true }
      );

      console.log("✅ Login Success:", response.data);

      if (response.data.requiresTwoFactor) {
        window.location.href = "/2fa";
        return;
      }

      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      setUser(response.data.user);
    } catch (error: any) {
      console.error("❌ Login Failed:", error);

      if (error.response) {
        console.error("📡 Server Response:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("❌ No Response from Server", error.request);
      } else {
        console.error("🛑 Request Error", error.message);
      }

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
  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

      setUser(null);
      Cookies.remove("user");

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout Failed:", error);
    }
  };

  // ✅ REQUEST PASSWORD RESET FUNCTION
  const requestPasswordReset = async (email: string) => {
    try {
      console.log("🔹 Sending password reset request for:", email);
      const response = await axios.post("http://localhost:5000/api/auth/request-reset", { email });

      console.log("📧 Password reset request sent.", response.data);
      toast.success("✅ Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("❌ Password Reset Request Failed:", error.response?.data || error.message);
      toast.error("❌ Failed to send password reset email. Please try again.");
      throw error;
    }
  };

  // ✅ RESET PASSWORD FUNCTION
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      console.log("📡 Sending request to reset password:", { token, newPassword });

      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword,
      });

      console.log("🔑 Password reset successful.", response.data);
      toast.success("✅ Password successfully changed!");

      window.location.href = "/signin";
      return response.data;
    } catch (error: any) {
      console.error("❌ Password Reset Failed:", error.response?.data || error.message);
      toast.error("❌ Failed to reset password. Please try again.");
      throw error;
    }
  };

  // ✅ VERIFY TWO-FACTOR AUTHENTICATION FUNCTION
  const verifyTwoFactor = async (code: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-2fa", { code });

      console.log("✅ 2FA Verified:", response.data);
      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      setUser(response.data.user);
    } catch (error: any) {
      console.error("❌ 2FA Verification Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ UPDATE USER INFO FUNCTION
  const updateUserInfo = async (userId: string, username: string, email: string, password: string, profileImage?: File) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (profileImage) formData.append("profileImage", profileImage);

      const response = await axios.put(`http://localhost:5000/api/auth/update/${userId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ User info updated:", response.data);

      if (response.data.user) {
        setUser(response.data.user);
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      }
    } catch (error: any) {
      console.error("❌ Update User Info Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ UPDATE PHONE NUMBER FUNCTION
  const updatePhoneNumber = async (userId: string, phone: string) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/update-phone/${userId}`,
        { phone },
        { withCredentials: true }
      );

      console.log("✅ Phone number updated:", response.data);

      if (response.data.user) {
        setUser(response.data.user);
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      }
    } catch (error: any) {
      console.error("❌ Update Phone Number Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ SEND OTP FUNCTION
  const sendOtp = async (userId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/auth/send-otp/${userId}`);
      console.log("✅ OTP sent successfully");
    } catch (error: any) {
      console.error("❌ Error sending OTP:", error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        requestPasswordReset,
        resetPassword,
        verifyTwoFactor,
        updateUserInfo,
        updatePhoneNumber,
        sendOtp,
      }}
    >
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
