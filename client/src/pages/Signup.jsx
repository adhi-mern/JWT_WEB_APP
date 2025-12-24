import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    // backend call later
    console.log({ email, username, password });
    navigate("/login");
  };

  return (
    <div className="page">
      <div className="box">
        <h2>Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleSignup}>Create Account</button>
      </div>
    </div>
  );
}

export default Signup;
