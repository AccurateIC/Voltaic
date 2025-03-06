import type { HttpContext } from "@adonisjs/core/http";
import { createPdmValidator } from "#validators/pdm";
import transmit from "@adonisjs/transmit/services/main";

export default class PdmController {
  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createPdmValidator);
    console.log(data);
    if (data) {
      transmit.broadcast("pdm", data);
    }
    return data;
  }
}
