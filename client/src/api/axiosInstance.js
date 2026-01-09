import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // backend URL
  timeout: 2000,                   // 2 sec
  withCredentials: true,            // allow cookies (refresh token)
  headers: {
    "Content-Type": "application/json"
  }
});

// request
instance.interceptors.request.use(
  (config) => {
   const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    //If token invalid / expired / manipulated
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await instance.post("/auth/refresh");

        const newToken = res.data.tocken;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);

      } catch (err) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;