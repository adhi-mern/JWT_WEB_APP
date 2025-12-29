import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';


function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async() => {
    console.log({ email, username, password });
    //useEffect isolates side effects
      try{
      const register = await axios.post("http://localhost:5000/signup", {
        email, username, password
      })
      alert(register.data.message);
       // redirect
    navigate("/login");
    }catch(error){
      console.log(error);
      alert("Signup failed");
    }
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
