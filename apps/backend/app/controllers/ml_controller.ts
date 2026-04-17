import type { HttpContext } from "@adonisjs/core/http";
import logger from "@adonisjs/core/services/logger";
import { Modules } from "../config/extern.js";

// Helper: fetch with a timeout so a slow/down ML server never hangs the request
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export default class MlController {
  /**
   * POST /ml/notify-login
   *
   * Fans out the login event to all 3 ML servers (PDM, RUL, Anomaly) in parallel.
   * Uses Promise.allSettled so a down/slow ML server never breaks the login flow.
   * Safe to call on every login — each ML server just updates its active-user state.
   */
  async notifyLogin({ request, response }: HttpContext) {
    const userData = request.body();
    const servers = [
      { name: "PDM", url: Modules.PDM + "/user" },
      { name: "RUL", url: Modules.RUL + "/user" },
      { name: "ANOMALY", url: Modules.ANOMALY + "/user" },
    ];

    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    };

    // Fan out to all 3 ML servers in parallel — allSettled never throws
    const results = await Promise.allSettled(
      servers.map((s) => fetchWithTimeout(s.url, fetchOptions))
    );

    // Log per-server outcome (server-side only, nothing leaks to client)
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        logger.info(`ML notify-login: ${servers[i].name} responded ${result.value.status}`);
      } else {
        logger.warn(
          { err: result.reason },
          `ML notify-login: ${servers[i].name} unreachable — skipping`
        );
      }
    });

    const failed = results.filter((r) => r.status === "rejected");

    // Always return 200 to the frontend — ML servers being down should never
    // block the user from logging in (partial_failure is informational only)
    if (failed.length > 0) {
      return response.status(207).json({
        message: `${failed.length}/3 ML servers could not be notified`,
        status: "partial_failure",
      });
    }

    return response.status(200).json({
      message: "All ML servers notified successfully",
      status: "success",
    });
  }
}