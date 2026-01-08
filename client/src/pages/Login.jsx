import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import instance from "../api/axiosInstance";

function Login() {
  const [username, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async() => {
    // backend call 
    try{
      const res = await instance.post('/auth/login', 
        {username, password}
    );
      localStorage.setItem("token", res.data.tocken);

      navigate("/home");
    }catch(er){
         alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page">
      <div className="box">
        <h2>Login</h2>

        <input
          placeholder="Email or Username"
          onChange={e => setIdentifier(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
            style={{ paddingRight: "40px" }}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
