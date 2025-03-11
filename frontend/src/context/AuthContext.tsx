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
  profileImage: string;
  twofa: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, captchaToken: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyTwoFactor: (userId: string, code: string) => Promise<void>;
  updateUserInfo: (userId: string, username: string, email: string, password: string, profileImage: File) => Promise<void>;
  sendOtp: (userId: string) => Promise<void>;
  updateTwoFaStatus: (userId: string, status: boolean, code: string) => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const verifyEmail = async (token: string) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auth/verify-email?token=${token}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    console.log("🔍 Réponse de l'API :", data);

    return response.ok;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification d'email :", error);
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Checking session...");

        // Get user from cookies or localStorage first
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          console.log("✅ Restoring user from localStorage...");
          setUser(JSON.parse(storedUser));
          return;
        }

        // Fetch user session from backend
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });

        if (!response.data.user || (!response.data.user.id && !response.data.user._id)) {
          console.warn("⚠️ No user data found in session.");
          setUser(null);
          return;
        }

        console.log("✅ Session restored:", response.data.user);
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user.profileImage) {
          const imageUrl = `http://localhost:5000${response.data.user.profileImage}?t=${new Date().getTime()}`;
          localStorage.setItem("profileImage", imageUrl);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.warn("⚠️ No active session found:", error.response?.data || error.message);
        } else {
          console.warn("⚠️ No active session found:", error);
        }
        setUser(null);
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

      if (response.data.user.twofa) {
        await sendOtp(response.data.user.id);
        window.location.href = `/2fa?userId=${response.data.user.id}`;
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
      window.location.href = `/verify-email?email=${email}`;

      return response.data;
    } catch (error: any) {
      console.error("❌ Signup Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("token");
      Cookies.remove("user");
      Cookies.remove("token");

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout Failed:", error);
    }
  };

  const updateUserInfo = async (
    userId: string | undefined,
    username: string,
    email: string,
    password: string,
    profileImage: File | null
  ) => {
    if (!userId) {
      console.error("❌ Cannot update user info: userId is undefined.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (profileImage) formData.append("profileImage", profileImage);

      console.log(`📡 Sending update request for user ${userId}`);

      const response = await axios.put(
        `http://localhost:5000/api/auth/update/${userId}`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ User Info Updated:", response.data.user);
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });

    } catch (error) {
      console.error("❌ Error updating user info:", error);
    }
  };

  const sendOtp = async (userId: string) => {
    await axios.post(`http://localhost:5000/api/auth/send-otp/${userId}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUserInfo,
        sendOtp,
        requestPasswordReset: async (email) => {
          await axios.post("http://localhost:5000/api/auth/request-reset", { email });
          toast.success(" Password reset email sent!");
        },
        resetPassword: async (token, newPassword) => {
          await axios.post("http://localhost:5000/api/auth/reset-password", { token, newPassword });
          toast.success(" Password successfully changed!");
        },
        verifyTwoFactor: async (userId, code) => {
          const response = await axios.post(`http://localhost:5000/api/auth/verify-2fa/${userId}`, { code });
          Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
          setUser(response.data.user);
        },
        updateTwoFaStatus: async (userId, status, otp) => { 
          await axios.post(`http://localhost:5000/api/auth/updatetwofa/${userId}`, { twofa: status, code: otp });
          toast.success('2FA status updated successfully');
        },
        setUser,
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