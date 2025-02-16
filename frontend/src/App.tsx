import { Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import SignUP from "./pages/signup";
import GetInvolved from "./pages/GetInvolved";
import Login from "./pages/SignIn";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/get-involved" element={<GetInvolved />} />
      <Route path="/signup" element={<SignUP />} />
      <Route path="/signin" element={<Login />} />
    </Routes>
  );
}

export default App;
