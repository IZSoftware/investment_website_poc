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

// Staff roles enter through the admin portal; INVESTOR stays investor-portal-only.
const ADMIN_PORTAL_ROLES = ["SUPER_ADMIN", "ADMIN", "DEV", "FINANCIAL_ADMIN"];

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

  // Shared session completion — used by verify-challenge and by the direct-login
  // path when the letter challenge is disabled in the environment.
  const completeSession = useCallback((auth) => {
    const accessToken = auth.accessToken;
    const refreshTokenVal = auth.refreshToken;
    const user = auth.user || {};

    if (!accessToken) throw new Error("No access token received");

    setTokens(accessToken, refreshTokenVal);

    const role = user.role || decodeJwtRole(accessToken) || "";
    const email = user.email || "";
    const name = user.fullName || "";

    // The normalized form is what gets stored and handed out. Pages gate on an exact
    // match (`ALLOWED_ROLES.includes(userRole)`, `userRole !== 'DEV'`), so keeping a raw
    // `ROLE_ADMIN` or a lowercase value would let the router admit someone that the
    // navbar and every page then treat as having no permissions at all.
    const normalizedRole = String(role).toUpperCase().replace(/^ROLE_/, "");
    const portal = ADMIN_PORTAL_ROLES.includes(normalizedRole) ? "admin" : "investor";

    setUserEmail(email);
    setUserRole(normalizedRole);
    setFullName(name);
    setLoginPortal(portal);
    setIsAuthenticated(true);

    sessionStorage.setItem(STORAGE_KEYS.AUTH, "true");
    sessionStorage.setItem(STORAGE_KEYS.EMAIL, email);
    sessionStorage.setItem(STORAGE_KEYS.ROLE, normalizedRole);
    sessionStorage.setItem(STORAGE_KEYS.PORTAL, portal);
    sessionStorage.setItem(STORAGE_KEYS.FULL_NAME, name);

    return { role: normalizedRole, portal };
  }, []);

  // Phase 1 — the service returns the envelope {success,message,data:{challenge?,auth?},errors}
  const login = useCallback(
    async (email, password) => {
      try {
        const envelope = await loginApi({ email, password });
        const payload = envelope.data || {};

        // Challenge disabled in this environment — tokens come back directly.
        if (payload.auth) {
          const { role, portal } = completeSession(payload.auth);
          return { success: true, authenticated: true, role, portal };
        }

        const challenge = payload.challenge;
        if (!challenge) {
          return {
            success: false,
            message: envelope.message || "Unexpected response. Please try again.",
          };
        }

        return {
          success: true,
          challengeId: challenge.challengeId,
          letters: challenge.letters || [],
          expiresInSeconds: challenge.expiresInSeconds || 180,
        };
      } catch (error) {
        return {
          success: false,
          status: error.response?.status,
          message: error.response?.data?.message || "Invalid email or password",
        };
      }
    },
    [completeSession]
  );

  // Phase 2
  const verifyChallengeHandler = useCallback(
    async (challengeId, answers) => {
      try {
        const envelope = await verifyChallenge({ challengeId, answers });
        const auth = envelope.data || envelope;

        const { role, portal } = completeSession(auth);
        return { success: true, role, portal };
      } catch (error) {
        return {
          success: false,
          status: error.response?.status,
          message: error.response?.data?.message || "Incorrect answers. Please try again.",
        };
      }
    },
    [completeSession]
  );

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