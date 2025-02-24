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
  profileImage: string;
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
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Checking session...");
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });
  
        console.log("✅ Session restored:", response.data);
        setUser(response.data.user);
  
        // ✅ Restore profile image from user data
        if (response.data.user.profileImage) {
          const imageUrl = `http://localhost:5000${response.data.user.profileImage}?t=${new Date().getTime()}`;
          localStorage.setItem("profileImage", imageUrl);
        }
      } catch (error) {
        console.warn("⚠️ No active session found:", error.response?.data || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    checkSession();
  }, []);
  
  
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
  
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
  
      // ✅ Store profile image separately for easy access
      if (response.data.user.profileImage) {
        const imageUrl = `http://localhost:5000${response.data.user.profileImage}?t=${new Date().getTime()}`;
        localStorage.setItem("profileImage", imageUrl);
      }
  
      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
  
    } catch (error: any) {
      console.error("❌ Login Failed:", error);
      throw error;
    }
  };
  

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

  const logout = async () => {
    try {
        await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

        // ✅ Clear user state
        setUser(null);
        localStorage.removeItem("user");
        Cookies.remove("user");
        Cookies.remove("token");
        localStorage.removeItem("token");
        console.log("✅ Logout successful");
    } catch (error) {
        console.error("❌ Logout Failed:", error);
    }
};



  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        requestPasswordReset: async (email) => {
          await axios.post("http://localhost:5000/api/auth/request-reset", { email });
          toast.success("✅ Password reset email sent!");
        },
        resetPassword: async (token, newPassword) => {
          await axios.post("http://localhost:5000/api/auth/reset-password", { token, newPassword });
          toast.success("✅ Password successfully changed!");
        },
        verifyTwoFactor: async (code) => {
          const response = await axios.post("http://localhost:5000/api/auth/verify-2fa", { code });
          Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
          setUser(response.data.user);
        },
        updateUserInfo: async (userId, username, email, password) => {
          const response = await axios.put(`http://localhost:5000/api/auth/update/${userId}`, {
            username,
            email,
            password,
          }, { withCredentials: true });
          setUser(response.data.user);
          Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
        },
        updatePhoneNumber: async (userId, phone) => {
          const response = await axios.put(`http://localhost:5000/api/auth/update-phone/${userId}`, { phone }, { withCredentials: true });
          setUser(response.data.user);
          Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
        },
        sendOtp: async (userId) => {
          await axios.post(`http://localhost:5000/api/auth/send-otp/${userId}`);
        },
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