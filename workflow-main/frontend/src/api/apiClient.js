import axios from 'axios';

// Create an Axios instance with a fixed baseURL
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Base URL for all API requests
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
});

// Add a request interceptor to attach the JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    // If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Return the modified config
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

const fetchProjects = async () => {
  const res = await apiClient.get('/projects'); // Base URL is already set
  return res.data;
};

export default apiClient;