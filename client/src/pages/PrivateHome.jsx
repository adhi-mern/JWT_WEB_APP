import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import instance from "../api/axiosInstance";

function PrivateHome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await instance.get("/auth/me");
        console.log("ME API RESPONSE:", res.data);
        setUser(res.data);

      } catch (err) {
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
