import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // backend call later
    localStorage.setItem("username", identifier);
    console.log(identifier);
    navigate("/home");
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
