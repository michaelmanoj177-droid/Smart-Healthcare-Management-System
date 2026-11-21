import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('shms_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('shms_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          setProfile(res.data.profile);
          localStorage.setItem('shms_user', JSON.stringify(res.data.user));
          if (res.data.profile) {
            localStorage.setItem('shms_profile', JSON.stringify(res.data.profile));
          }
        } catch (err) {
          console.error("Token verification error:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: loggedUser, profile: loggedProfile } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    setProfile(loggedProfile);
    localStorage.setItem('shms_token', access_token);
    localStorage.setItem('shms_user', JSON.stringify(loggedUser));
    if (loggedProfile) {
      localStorage.setItem('shms_profile', JSON.stringify(loggedProfile));
    }
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data.access_token) {
      setToken(res.data.access_token);
      setUser(res.data.user);
      localStorage.setItem('shms_token', res.data.access_token);
      localStorage.setItem('shms_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('shms_token');
    localStorage.removeItem('shms_user');
    localStorage.removeItem('shms_profile');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
      setProfile(res.data.profile);
      localStorage.setItem('shms_user', JSON.stringify(res.data.user));
      if (res.data.profile) {
        localStorage.setItem('shms_profile', JSON.stringify(res.data.profile));
      }
    } catch (e) {
      console.error("Failed to refresh user profile", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
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
