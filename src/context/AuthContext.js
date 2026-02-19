import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  AUTH: 'auth:isAuthenticated',
  OTP: 'auth:isOtpVerified',
  EMAIL: 'auth:userEmail',
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // These MUST come from .env – no fallbacks, no hardcoding
  const DEMO_EMAIL    = process.env.REACT_APP_DEMO_EMAIL;
  const DEMO_PASSWORD = process.env.REACT_APP_DEMO_PASSWORD;
  const DEMO_OTP      = process.env.REACT_APP_DEMO_OTP;

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
      const storedOtp = sessionStorage.getItem(STORAGE_KEYS.OTP) === 'true';
      const storedEmail = sessionStorage.getItem(STORAGE_KEYS.EMAIL) || '';

      setIsAuthenticated(storedAuth);
      setIsOtpVerified(storedOtp);
      setUserEmail(storedEmail);
    } catch (err) {
      console.warn('Failed to restore auth state from sessionStorage', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email, password) => {
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return { success: false, message: 'Invalid email or password' };
    }

    setIsAuthenticated(true);
    setUserEmail(email);
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    sessionStorage.setItem(STORAGE_KEYS.EMAIL, email);

    return { success: true };
  };

  const verifyOtp = (otp) => {
    if (otp !== DEMO_OTP) {
      return { success: false, message: 'Invalid OTP' };
    }

    setIsOtpVerified(true);
    sessionStorage.setItem(STORAGE_KEYS.OTP, 'true');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsOtpVerified(false);
    setUserEmail('');
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    sessionStorage.removeItem(STORAGE_KEYS.OTP);
    sessionStorage.removeItem(STORAGE_KEYS.EMAIL);
  };

  const value = {
    isAuthenticated,
    isOtpVerified,
    isFullyAuthenticated: isAuthenticated && isOtpVerified,
    userEmail,
    loading,
    login,
    verifyOtp,
    logout,
    DEMO_EMAIL,
    DEMO_PASSWORD,
    DEMO_OTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};