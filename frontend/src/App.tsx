import { Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import SignUP from "./pages/signup";
import GetInvolved from "./pages/GetInvolved";
import Login from "./pages/SignIn";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/get-involved" element={<GetInvolved />} />
      <Route path="/signup" element={<SignUP />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

    </Routes>
  );
}

export default App;
