import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import Cookies from "js-cookie"; // ✅ Import js-cookie
//import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";


interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phoneNumber: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  updateUserInfo: (
    userId: string,
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  updatePhoneNumber: (userId: string, phone: string) => Promise<void>;
  sendOtp: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = Cookies.get("user"); // ✅ Retrieve user from cookies
   // console.log("🔹 Checking user in cookies after reload:", storedUser);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ LOGIN FUNCTION
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      console.log("✅ Login Success:", response.data);

      if (response.data.requiresTwoFactor) {
        window.location.href = "/2fa"; // Redirect to 2FA if required
        return;
      }

      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 }); // ✅ Store user in cookies
      setUser(response.data.user);
    } catch (error: any) {
      console.error(
        "❌ Login Failed:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  };

  // ✅ SIGNUP FUNCTION
  const signup = async (
    username: string,
    email: string,
    password: string,
    role: string
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          username,
          email,
          password,
          role,
        }
      );

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
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      // ✅ Ensure user state is cleared
      setUser(null);

      // ✅ Manually remove the user from cookies
      Cookies.remove("token");
      Cookies.remove("user");

      console.log("✅ Logout successful, user and token removed.");
    } catch (error) {
      console.error("❌ Logout Failed:", error);
    }
  };

  //  PASSWORD RESET REQUEST
  const requestPasswordReset = async (email: string) => {
    try {
      console.log("🔹 Envoi de la requête de reset pour:", email);
      const response =  await axios.post("http://localhost:5000/api/auth/request-reset", {  email, });
    
       console.log("📧 Password reset request sent.", response.data);
      //  Notification de succès
      console.log("✅ Avant notification de succès !");
      toast.success("✅ Email envoyé ! Vérifiez votre boîte mail.");
      console.log("✅ Après notification de succès !");     } catch (error: any) {
      console.error(
        "❌ Password Reset Request Failed:",
        error.response?.data || error.message
      );
      toast.error("❌ Échec de l'envoi de l'email. Veuillez réessayer.");

      throw error;
    }
  };

  
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      
      console.log("📡 Sending request to reset password:", { token, newPassword });
      const response = await axios.post("http://localhost:5000/api/auth/reset-password",  { token, newPassword });

     // const response= await axios.post("http://localhost:5000/api/auth/request-reset",  { token, newPassword });
     
      console.log("🔑 Password reset successful.", response.data);
      toast.success("✅ Mot de passe changé avec succès !");

      alert("password changed ");
     
     
      window.location.href = "/signin";  // Change l'URL actuelle du navigateur
      return response.data;
    
    } catch (error: any) {
      console.error(
        "❌ Password Reset Failed:",
        error.response?.data || error.message
      );
      toast.error("❌ Échec de la réinitialisation. Veuillez réessayer.");

      throw error;
    }
  };

  // ✅ VERIFY TWO-FACTOR AUTHENTICATION CODE
  const verifyTwoFactor = async (code: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-2fa",
        { code }
      );

      console.log("✅ 2FA Verified:", response.data);
      Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      setUser(response.data.user);
    } catch (error: any) {
      console.error(
        "❌ 2FA Verification Failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  };
  // ✅ UPDATE USER INFO FUNCTION
  const updateUserInfo = async (
    userId: string,
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/update/${userId}`,
        { username, email, password },
        { withCredentials: true }
      );

      console.log("✅ User info updated:", response.data);

      // Update the user in the context and cookies
      if (response.data.user) {
        setUser(response.data.user);
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      }
    } catch (error: any) {
      console.error(
        "❌ Update User Info Failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const updatePhoneNumber = async (userId: string, phone: string) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/update-phone/${userId}`,
        { phone },
        { withCredentials: true }
      );
  
      console.log("Phone number updated:", response.data);
  
      // Update the user in the context and cookies
      if (response.data.user) {
        setUser(response.data.user);
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      }
  
    } catch (error: any) {
      console.error(
        "Update Phone Number Failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const sendOtp = async (userId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/auth/send-otp/${userId}`);
      console.log('OTP sent successfully');
    } catch (error: any) {
      console.error('Error sending OTP:', error.response?.data || error.message);
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