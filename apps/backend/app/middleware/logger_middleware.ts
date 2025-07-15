import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import { DateTime } from "luxon";

export default class LoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startTime = DateTime.now();
    const { request, response } = ctx;

    const output = await next();

    const endTime = DateTime.now();
    const responseTime = endTime.diff(startTime, "milliseconds").milliseconds;

    // ctx.logger.info(
    //   `${request.method()} ${request.url()} ${response.response.statusCode} ${responseTime}ms - ${request.ip()}`
    // );

    // Log response details
    ctx.logger.info({
      type: "response",
      method: request.method(),
      url: request.url(),
      path: request.parsedUrl.pathname,
      statusCode: response.response.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: response.response.getHeader("content-length"),
      requestHeaders: request.headers(),
      requestBody: request.body(),
      responseHeaders: response.response.getHeaders(),
      responseBody: output,
      timestamp: endTime.toISO(),
    });

    return output;
  }
}
