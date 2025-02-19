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
import UpdateProfile from "./pages/UpdateProfile ";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (user === undefined) {
    return <div>Loading...</div>; // Prevent redirect until authentication is known
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/get-involved" element={<GetInvolved />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} /> 
      <Route path="/2fa" element={<TwoFactorAuth />} />  

      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="UpdateProfile/:userId" element={<UpdateProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
