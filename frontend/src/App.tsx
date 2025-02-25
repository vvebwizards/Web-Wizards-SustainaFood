import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/HomePage";
import SignUp from "./pages/signup";
import GetInvolved from "./pages/GetInvolved";
import Login from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import Users from "./pages/UserManagement";
import UpdateProfile from "./pages/UpdateProfile ";
import { NotificationProvider } from "./context/NotificationContext";
import { AdminProvider } from "./context/AdminContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (user === null) {
    return <div>Loading...</div>; // Prevent redirect until session is checked
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <NotificationProvider>
                <Layout />
              </NotificationProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          
          <Route 
            path="UsersManagement" 
            element={
              <AdminProvider>
                <Users />
              </AdminProvider>
            } 
          />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="UpdateProfile/:userId" element={<UpdateProfile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
