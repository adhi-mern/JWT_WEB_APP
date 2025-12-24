import { useNavigate } from "react-router-dom";

function PublicHome() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="box">
        <h2>Welcome</h2>
        <button onClick={() => navigate("/signup")}>Sign Up</button>
        <button
          className="secondary"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default PublicHome;
