import axios from 'axios';

// Helper function to get a cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Adjust your base URL as needed
});

// Request interceptor to add the token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Assuming your token is stored in a cookie named 'token'
    const token = getCookie('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Or however your backend expects it
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;