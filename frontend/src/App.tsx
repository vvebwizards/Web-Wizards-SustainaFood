import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/HomePage";
import SignUp from "./pages/signup";
import GetInvolved from "./pages/GetInvolved";
import Login from "./pages/SignIn";
import GameCenter from "./pages/GameCenter";
import ChatPage from "./pages/ChatPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MemoryGame from "./games/MemoryGame";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import { StatsDashboard } from "./components/StatsDashboard";
import TicTacToe from "./games/TicTacToe";
import Notifications from "./pages/Notifications";
import Users from "./pages/UserManagement";
import UpdateProfile from "./pages/UpdateProfile ";
import WelcomePage from "./pages/WelcomePage";
import { NotificationProvider } from "./context/NotificationContext";
import { AdminProvider } from "./context/AdminContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicRoute from "./components/PublicRoute";
import Inventory from "./pages/Inventory";
import { InventoryProvider } from "./context/InventoryContext";
import { SettingsProvider } from "./context/SettingsContext";
import FoodBank from "./pages/FoodBank";
import { FoodBankProvider } from "./context/FoodBankContext";
import VerifyEmail from "./pages/VerifyEmail";
import SpinWheel from "./games/SpinWheel";
import ConfirmEmail from "./pages/ConfirmEmail";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";
import MyRequests from "./pages/MyRequests";
import QuizChallenge from "./games/QuizChallenge";
import OrdersList from "./pages/OrdersList";
import OrderDetails from "./pages/OrderDetails";
import Deliveriess from "./pages/Deliveriess";
import { StatisticsProvider } from "./context/StatisticsContext";
import { Overview } from "./pages/overview";
import Leaderboard from "./pages/Leaderboard";
import Redeem from "./pages/Redeem";
import ChatBot from "./components/ChatBot/ChatBot";
import DeliveriesRoutes from "./pages/Deliveries";
import CarbonFootprintCalculator from "./components/Carbon/CarbonFootprintCalculator";
import MyDonations from "./pages/MyDonations";
import AllDonations from "./pages/AllDonations";

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
  const location = useLocation();

  // Define the path(s) where ChatBot should be hidden
  const hideChatbotOnPaths = ["/dashboard/chat"];

  const shouldShowChatbot = !hideChatbotOnPaths.includes(location.pathname);
  return (
    <>
      {shouldShowChatbot && <ChatBot />}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

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
                <CartProvider>
                  <Layout />
                </CartProvider>
              </NotificationProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<WelcomePage />} />
          <Route
            path="profile"
            element={
              <StatisticsProvider>
                <Profile />
              </StatisticsProvider>
            }
          />
          <Route path="redeem" element={<Redeem />} />
          <Route path="my-donations" element={<MyDonations />} />
          <Route path="donations" element={<AllDonations />} />
          <Route
            path="UsersManagement"
            element={
              <AdminProvider>
                <Users />
              </AdminProvider>
            }
          />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="my-requests" element={<MyRequests />} />
          <Route path="notifications" element={<Notifications />} />
          <Route
            path="UpdateProfile/:userId"
            element={
              <SettingsProvider>
                <UpdateProfile />
              </SettingsProvider>
            }
          />

          <Route
            path="inventory"
            element={
              <InventoryProvider>
                <Inventory />
              </InventoryProvider>
            }
          />
          <Route
            path="available"
            element={
              <FoodBankProvider>
                <FoodBank />
              </FoodBankProvider>
            }
          />

          <Route path="cart" element={<Cart />} />
          <Route path="game-center" element={<GameCenter />} />
          <Route path="quiz-challenge" element={<QuizChallenge />} />
          <Route path="prize-wheel" element={<SpinWheel />} />
          <Route path="/dashboard/memory" element={<MemoryGame />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="Deliveriess" element={<Deliveriess />} />

          <Route path="deliveries" element={<DeliveriesRoutes />} />
          <Route path="carbon" element={<CarbonFootprintCalculator />} />

          <Route path="/dashboard/tictactoe" element={<TicTacToe />} />
          <Route
            path="/dashboard/StatsDashboard"
            element={<StatsDashboard />}
          />
          <Route path="/dashboard/overview" element={<Overview />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
