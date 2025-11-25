import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  const api = axios.create({
    baseURL: '/api/v1',
  });

  // Interceptor to add token to requests
  api.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          const response = await api.get('/users/current-user');
          setUser(response.data.data); // Assuming response structure { data: user }
        } catch (error) {
          console.error("Auth check failed", error);
          setAccessToken(null);
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [accessToken]);

  const login = async (data) => {
    try {
      const response = await api.post('/users/login', data);
      const { accessToken: newAccessToken, user: userData } = response.data.data;
      setAccessToken(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);
      setUser(userData);
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      console.error("Login error", error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (formData) => {
    try {
      // Register usually doesn't return token immediately in some flows, but if it does:
      // For now assuming it just registers and user needs to login, or returns same as login
      // Based on typical flows. If it logs in automatically:
      const response = await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      console.error("Register error", error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint if exists
      // await api.post('/users/logout'); 
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      setUser(null);
      toast.success('Logged out');
    }
  };

  const updateCoverImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('coverImage', file);
        const response = await api.patch('/users/cover-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        setUser(prev => ({ ...prev, coverImage: response.data.data.coverImage }));
        toast.success("Cover image updated");
    } catch (error) {
        toast.error("Failed to update cover image");
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateCoverImage,
    api // Expose api instance for other components to use
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
