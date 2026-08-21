import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { setTokens, clearTokens, getRefreshToken } from "../api/axios-http";
import { login as loginApi, verifyChallenge, logout as logoutApi } from "../api/services";
import { decodeJwtRole } from "../utils/jwt";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  AUTH: "auth:isAuthenticated",
  EMAIL: "auth:userEmail",
  ROLE: "auth:userRole",
  PORTAL: "auth:loginPortal",
  FULL_NAME: "auth:fullName",
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [loginPortal, setLoginPortal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem(STORAGE_KEYS.AUTH) === "true";
    const storedEmail = sessionStorage.getItem(STORAGE_KEYS.EMAIL) || "";
    const storedRole = sessionStorage.getItem(STORAGE_KEYS.ROLE) || "";
    const storedPortal = sessionStorage.getItem(STORAGE_KEYS.PORTAL) || "";
    const storedName = sessionStorage.getItem(STORAGE_KEYS.FULL_NAME) || "";

    setIsAuthenticated(storedAuth);
    setUserEmail(storedEmail);
    setUserRole(storedRole);
    setLoginPortal(storedPortal);
    setFullName(storedName);
    setLoading(false);
  }, []);

  // Phase 1
  const login = useCallback(async (email, password) => {
    try {
      const data = await loginApi({ email, password });
      const challenge = data.challenge || data;
      return {
        success: true,
        challengeId: challenge.challengeId,
        letters: challenge.letters || [],
        expiresInSeconds: challenge.expiresInSeconds || 180,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password",
      };
    }
  }, []);

  // Phase 2
  const verifyChallengeHandler = useCallback(async (challengeId, answers) => {
    try {
      const data = await verifyChallenge({ challengeId, answers });

      const accessToken = data.accessToken || data.data?.accessToken;
      const refreshTokenVal = data.refreshToken || data.data?.refreshToken;
      const user = data.user || data.data?.user || {};

      if (!accessToken) throw new Error("No access token received");

      setTokens(accessToken, refreshTokenVal);

      const role = user.role || decodeJwtRole(accessToken) || "";
      const email = user.email || "";
      const name = user.fullName || "";

      const adminRoles = ["SUPER_ADMIN", "ADMIN", "ROLE_SUPER_ADMIN", "ROLE_ADMIN"];
      const isAdmin = adminRoles.some((r) => role.toUpperCase() === r.toUpperCase());
      const portal = isAdmin ? "admin" : "investor";

      setUserEmail(email);
      setUserRole(role);
      setFullName(name);
      setLoginPortal(portal);
      setIsAuthenticated(true);

      sessionStorage.setItem(STORAGE_KEYS.AUTH, "true");
      sessionStorage.setItem(STORAGE_KEYS.EMAIL, email);
      sessionStorage.setItem(STORAGE_KEYS.ROLE, role);
      sessionStorage.setItem(STORAGE_KEYS.PORTAL, portal);
      sessionStorage.setItem(STORAGE_KEYS.FULL_NAME, name);

      return { success: true, role, portal };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Incorrect answers. Please try again.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const rt = getRefreshToken();
      if (rt) {
        try {
          await logoutApi({ refreshToken: rt });
        } catch (err) {
          console.warn("Logout API failed, continuing local cleanup", err);
        }
      }
    } finally {
      const portal = sessionStorage.getItem(STORAGE_KEYS.PORTAL) || "investor";
      clearTokens();
      setIsAuthenticated(false);
      setUserEmail("");
      setUserRole("");
      setFullName("");
      setLoginPortal("");

      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
      sessionStorage.removeItem(STORAGE_KEYS.EMAIL);
      sessionStorage.removeItem(STORAGE_KEYS.ROLE);
      sessionStorage.removeItem(STORAGE_KEYS.PORTAL);
      sessionStorage.removeItem(STORAGE_KEYS.FULL_NAME);

      window.location.href =
        portal === "admin" ? "/admin-portal/login" : "/investor-portal/login";
    }
  }, []);

  const value = {
    isAuthenticated,
    isFullyAuthenticated: isAuthenticated,
    userEmail,
    userRole,
    fullName,
    loginPortal,
    loading,
    login,
    verifyChallenge: verifyChallengeHandler,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};