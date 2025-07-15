import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import { DateTime } from "luxon";

export default class LoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startTime = DateTime.now();
    const { request, response } = ctx;

    const output = await next();

    const endTime = DateTime.now();
    const responseTime = endTime.diff(startTime, 'milliseconds').milliseconds;

    ctx.logger.info(`${request.method()} ${request.url()} ${response.response.statusCode} ${responseTime}ms - ${request.ip()}`);

    return output;
  }
}
