import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PrivateHome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        const res = await axios.post("http://localhost:5000/auth/refresh",{}, {
          withCredentials: true
        });
        // navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("ME API RESPONSE:", res.data);
        setUser(res.data);

      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
        console.log(err);
      }
    };

    fetchMe();
  }, []);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div className="page">
      <div className="box">
        <h2>Welcome "{user.username}"</h2>
      </div>
    </div>
  );
}

export default PrivateHome;
