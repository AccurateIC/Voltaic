import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { SessionStore } from "../lib/SessionStore";
import { tuyau } from "../lib/Tuyau";
import { Modules } from "../config/extern";

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

export function useOptimisticLogout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);

      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      // Optimistic logout: clear UI state first for instant feedback.
      SessionStore.clear();
      localStorage.removeItem("user");

      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });

      // Complete external and backend session cleanup in background.
      void (async () => {
        try {
          if (parsedUser) {
            const notifyPayload = { ...parsedUser, logged_in: false };
            await Promise.allSettled([
              fetchWithTimeout(Modules.PDM + "/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notifyPayload),
              }),
              fetchWithTimeout(Modules.RUL + "/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notifyPayload),
              }),
              fetchWithTimeout(Modules.ANOMALY + "/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notifyPayload),
              }),
            ]);
          }

          await tuyau.auth.logout.$post();
        } catch (error) {
          console.error("Background logout failed", error);
        }
      })();
    } catch {
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
