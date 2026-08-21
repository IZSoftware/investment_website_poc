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

      // Handles both nested and flat response shapes
      const challenge = data?.data?.challenge || data?.challenge || data;

      if (!challenge?.challengeId || !challenge?.letters) {
        return {
          success: false,
          message: "Invalid response from server",
        };
      }

      return {
        success: true,
        challengeId: challenge.challengeId,
        letters: challenge.letters,
        expiresInSeconds: challenge.expiresInSeconds || 180,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password",
      };
    }
  }, []);

  // Phase 2 – FIXED for nested data
  const verifyChallengeHandler = useCallback(async (challengeId, answers) => {
    try {
      const data = await verifyChallenge({ challengeId, answers });

      // Real success response:
      // { success, message, data: { accessToken, refreshToken, user: {...} } }
      const payload = data?.data || data;

      const accessToken = payload.accessToken;
      const refreshTokenVal = payload.refreshToken;
      const user = payload.user || {};

      if (!accessToken) {
        return {
          success: false,
          message: "No access token received",
        };
      }

      setTokens(accessToken, refreshTokenVal);

      const role = user.role || decodeJwtRole(accessToken) || "";
      const email = user.email || "";
      const name = user.fullName || "";

      const adminRoles = ["SUPER_ADMIN", "ADMIN", "ROLE_SUPER_ADMIN", "ROLE_ADMIN"];
      const isAdmin = adminRoles.some((r) => role.toUpperCase() === r.toUpperCase());
      const portal = isAdmin ? "admin" : "investor";

      // Set sessionStorage FIRST, then state — so that if any consumer reads
      // storage synchronously right after this resolves, it sees fresh values,
      // not the previous session's leftovers.
      sessionStorage.setItem(STORAGE_KEYS.AUTH, "true");
      sessionStorage.setItem(STORAGE_KEYS.EMAIL, email);
      sessionStorage.setItem(STORAGE_KEYS.ROLE, role);
      sessionStorage.setItem(STORAGE_KEYS.PORTAL, portal);
      sessionStorage.setItem(STORAGE_KEYS.FULL_NAME, name);

      setUserEmail(email);
      setUserRole(role);
      setFullName(name);
      setLoginPortal(portal);
      setIsAuthenticated(true);

      return { success: true, role, portal };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Incorrect answers. Please try again.",
      };
    }
  }, []);

  // FIXED: logout no longer does a hard `window.location.href` redirect.
  // A hard redirect tears down the whole React tree — including this
  // AuthProvider — mid-flight, which is what caused the two bugs you saw:
  //   1. Logging out of one portal then logging into the other in the same
  //      tab could land you on the wrong portal, because the old AuthProvider
  //      instance's in-flight state updates raced against the reload.
  //   2. Client-side navigation (e.g. clicking back) inside the investor
  //      portal could hit a moment where sessionStorage had just been cleared
  //      by a prior hard reload that hadn't finished, so ProtectedRoute read
  //      `isFullyAuthenticated: false` and bounced you to the homepage.
  //
  // Now logout clears state/storage and lets React Router perform a normal
  // client-side navigation via the `navigate` function passed in by the
  // caller (AdminNavbar / InvestorNavbar). No full page reload, no race.
  const logout = useCallback(async (navigate) => {
    const portal = sessionStorage.getItem(STORAGE_KEYS.PORTAL) || "investor";

    try {
      const rt = getRefreshToken();
      if (rt) {
        try {
          await logoutApi(rt);
        } catch (err) {
          console.warn("Logout API failed, continuing local cleanup", err);
        }
      }
    } finally {
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

      const destination = portal === "admin" ? "/admin-portal/login" : "/investor-portal/login";

      if (navigate) {
        navigate(destination, { replace: true });
      } else {
        // Fallback only if a caller forgets to pass navigate — still works,
        // just loses the "no hard reload" benefit for that one call site.
        window.location.href = destination;
      }
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