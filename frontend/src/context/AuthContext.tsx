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
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Prevents flickering during session check

  // ✅ Check if the user is authenticated (Runs once on page load)
  useEffect(() => {
    const verifySession = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true, // ✅ Sends cookies to verify session
        });

        if (response.data.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Session verification failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // ✅ LOGIN FUNCTION
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true } // ✅ Allows backend to set authentication cookies
      );

      if (response.data.requiresTwoFactor) {
        window.location.href = "/2fa"; // Redirect if 2FA is needed
        return;
      }

      setUser(response.data.user); // ✅ Set user in state
    } catch (error) {
      console.error("❌ Login Failed:", error);
      throw error;
    }
  };

  // ✅ SIGNUP FUNCTION
  const signup = async (username: string, email: string, password: string, role: string) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/signup",
        { username, email, password, role },
        { withCredentials: true }
      );

      // ✅ Fetch user after signing up
      const response = await axios.get("http://localhost:5000/api/auth/me", { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.error("❌ Signup Failed:", error);
      throw error;
    }
  };

  // ✅ LOGOUT FUNCTION
  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });

      setUser(null); // ✅ Clears the user state on logout
    } catch (error) {
      console.error("❌ Logout Failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {!loading && children} {/* ✅ Prevents rendering children until auth check is done */}
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
