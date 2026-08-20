import React, { createContext, useState, useEffect, useContext } from 'react';
import { get, post, put } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      get('/auth/me')
        .then(res => setUser(res.data.data))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await post('/auth/login', { email, password });
    const authData = res.data.data;
    const access_token = authData.access_token || authData.tokens?.access_token;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(authData.user);
  };

  const register = async (data) => {
    const res = await post('/auth/register', data);
    const authData = res.data.data;
    const access_token = authData.access_token || authData.tokens?.access_token;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(authData.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateProfile = async (data) => {
    const res = await put('/auth/me', data);
    setUser(res.data.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
