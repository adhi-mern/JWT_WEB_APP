import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async() => {
    // backend call 
    try{
      const res = await axios.post('http://localhost:5000/auth/login', {
        username, password
      });
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

        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
