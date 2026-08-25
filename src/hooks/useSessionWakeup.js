import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios-http";

const SESSION_KEY = "app:lastActivity";

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes
const WAKEUP_WAIT_MS = 5 * 1000; // 5 seconds

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

export function useSessionWakeup() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const inactivityTimerRef = useRef(null);


  const updateActivity = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
  }, []);


  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);


  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();

    inactivityTimerRef.current = setTimeout(() => {
      sessionStorage.removeItem(SESSION_KEY);
      inactivityTimerRef.current = null;
    }, SESSION_TTL_MS);
  }, [clearInactivityTimer]);

  const handleActivity = useCallback(() => {
    updateActivity();
    startInactivityTimer();
  }, [updateActivity, startInactivityTimer]);

  const wakeBackend = useCallback(async () => {
    try {
      await api.get("/api/site/info");
    } catch (error) {
      console.warn(
        "Backend wake-up request failed. The application will continue initialization.",
        error
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const lastActivity = sessionStorage.getItem(SESSION_KEY);
      const now = Date.now();

      const hasExpired =
        !lastActivity ||
        now - Number(lastActivity) >= SESSION_TTL_MS;
      if (!hasExpired) {
        updateActivity();
        startInactivityTimer();

        if (isMounted) {
          setIsInitializing(false);
        }

        return;
      }

      if (isMounted) {
        setIsWakingUp(true);
      }

      const wakeupStartTime = Date.now();

      await wakeBackend();
      const elapsedTime = Date.now() - wakeupStartTime;

      const remainingWaitTime = Math.max(
        0,
        WAKEUP_WAIT_MS - elapsedTime
      );

      if (remainingWaitTime > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, remainingWaitTime);
        });
      }

    //  Create a fresh activity session.
      updateActivity();
      startInactivityTimer();

      if (isMounted) {
        setIsWakingUp(false);
        setIsInitializing(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      clearInactivityTimer();
    };
  }, [
    updateActivity,
    startInactivityTimer,
    clearInactivityTimer,
    wakeBackend,
  ]);

    // Listen for user activity.
  useEffect(() => {
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity]);

  return {
    isInitializing,
    isWakingUp,
  };
}