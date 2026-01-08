import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import instance from "../api/axiosInstance";

function PrivateHome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      let token = localStorage.getItem("token");

      if (!token) {
        try {
          const res = await instance.post("/auth/refresh");
        
        localStorage.setItem("token", res.data.tocken);
        token = localStorage.getItem("token");

        } catch (error) {
          navigate("/login");
        return;// stop exution here
        }
        // navigate("/login");
        // return;
      }
      

      try {
        const res = await instance.get("/auth/me", {
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
