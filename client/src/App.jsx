import { Routes, Route } from "react-router-dom";
import PublicHome from "./pages/PublicHome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PrivateHome from "./pages/PrivateHome";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<PrivateHome />} />
    </Routes>
  );
}

export default App;
