import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // backend URL
  timeout: 2000,                   // 2 sec
  withCredentials: true,            // allow cookies (refresh token)
  headers: {
    "Content-Type": "application/json"
  }
});

//Auto Refresh Token (Response Interceptor)
export default instance;