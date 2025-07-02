import axios from "axios"; 
import Cookies from "js-cookie"; 
import { HOST } from "./constants"; 

// Create an Axios instance with the base URL
const apiClient = axios.create({
  baseURL: HOST,
});

// Interceptor to attach auth token to requests (except login/signup)
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access-token"); 

    // Attach token to Authorization header if available and not for login/signup routes
    if (
      token &&
      !config.url.includes("/login") &&
      !config.url.includes("/signup")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
