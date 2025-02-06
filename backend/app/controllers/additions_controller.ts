import type { HttpContext } from "@adonisjs/core/http";
import { addValidator } from "#validators/add";

export default class AdditionsController {
  async add({ request, response }: HttpContext) {
    const data = await request.validateUsing(addValidator);
    console.log(data.a);
    return { result: data.a + data.b };
  }
}
