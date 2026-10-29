import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jansahayata_token') || null);
  const [loading, setLoading] = useState(true);

  // Configure Axios defaults when token updates
  useEffect(() => {
    if (token) {
      localStorage.setItem('jansahayata_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('jansahayata_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Restore authenticated session on initial mount
  const restoreUser = useCallback(async () => {
    const storedToken = localStorage.getItem('jansahayata_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (response.data?.success && response.data.user) {
        const userData = response.data.user;
        if (userData.role === 'SUPER_ADMIN' && (!userData.name || userData.name === 'Dr. Alok Verma, IAS')) {
          userData.name = 'Phaniswar';
        }
        setUser(userData);
        setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jansahayata_token');
      }
    } catch (err) {
      console.warn('[AuthContext] Session restore failed or expired:', err.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('jansahayata_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreUser();
  }, [restoreUser]);

  // Citizen Login
  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    if (res.data?.success) {
      const userData = res.data.user;
      if (userData?.role === 'SUPER_ADMIN' && (!userData.name || userData.name === 'Dr. Alok Verma, IAS')) {
        userData.name = 'Phaniswar';
      }
      setToken(res.data.token);
      setUser(userData);
      localStorage.setItem('jansahayata_token', res.data.token);
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  // Staff / Official Login (Employees & Super Admins)
  const staffLogin = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/auth/staff-login`, { email, password });
    if (res.data?.success) {
      const userData = res.data.user;
      if (userData?.role === 'SUPER_ADMIN' && (!userData.name || userData.name === 'Dr. Alok Verma, IAS')) {
        userData.name = 'Phaniswar';
      }
      setToken(res.data.token);
      setUser(userData);
      localStorage.setItem('jansahayata_token', res.data.token);
      return res.data;
    }
    throw new Error(res.data?.message || 'Staff authentication failed');
  };

  // Citizen Registration
  const register = async (userData) => {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    if (res.data?.success) {
      const userData = res.data.user;
      if (userData?.role === 'SUPER_ADMIN' && (!userData.name || userData.name === 'Dr. Alok Verma, IAS')) {
        userData.name = 'Phaniswar';
      }
      setToken(res.data.token);
      setUser(userData);
      localStorage.setItem('jansahayata_token', res.data.token);
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  // Logout
  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('jansahayata_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const role = user?.role || null;
  const isAuthenticated = !!user;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isEmployee = role === 'EMPLOYEE';
  const isCitizen = role === 'CITIZEN';

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = {
    user,
    token,
    role,
    loading,
    isAuthenticated,
    isSuperAdmin,
    isEmployee,
    isCitizen,
    login,
    staffLogin,
    register,
    logout,
    updateUser,
    refreshUser: restoreUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
