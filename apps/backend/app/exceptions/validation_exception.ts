import { Exception } from "@adonisjs/core/exceptions";
import { HttpContext } from "@adonisjs/core/http";

export default class ValidationException extends Exception {
  static status = 400;
  static code = "E_VALIDATION_ERROR";

  async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(this.status)
      .send({
        type: this.code,
        title: "Validation of inputs failed",
        detail: error.message,
        status: this.status,
      });
  }
}
