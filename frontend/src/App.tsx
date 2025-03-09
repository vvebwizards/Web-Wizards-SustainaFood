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
import Notifications from "./pages/Notifications";
import Users from "./pages/UserManagement";
import UpdateProfile from "./pages/UpdateProfile ";
import WelcomePage from "./pages/WelcomePage";
import { NotificationProvider } from "./context/NotificationContext";
import { AdminProvider } from "./context/AdminContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicRoute from "./components/PublicRoute"; // Import the PublicRoute component
import Inventory from "./pages/Inventory";
import { InventoryProvider } from "./context/InventoryContext";
import { SettingsProvider } from "./context/SettingsContext";
import FoodBank from "./pages/FoodBank";
import { FoodBankProvider } from "./context/FoodBankContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (user === undefined) {
    return <div>Loading...</div>;
  }




  if (user === null) {
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

        {/* Wrap public routes with PublicRoute */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
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
          <Route index element={<WelcomePage />} />
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
          <Route path="settings" element={<SettingsProvider><Settings /></SettingsProvider>}></Route>
          <Route path="notifications" element={<Notifications />} />
          <Route path="UpdateProfile/:userId" element={<UpdateProfile />} />
          <Route path="inventory" element={ <InventoryProvider><Inventory /> </InventoryProvider> } />
          <Route path="available" element={
            <FoodBankProvider>
              <FoodBank />
            </FoodBankProvider>
          } />
        </Route>
      </Routes>
    </>
  );
}

export default App;
