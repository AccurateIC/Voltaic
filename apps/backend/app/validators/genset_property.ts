import vine from "@vinejs/vine";
import { UUID } from "node:crypto";

export const createGensetPropertyValidator = vine.compile(
  vine.object({
    propertyName: vine //
      .string()
      .minLength(1)
      .unique({ table: "genset_properties", column: "property_name" }),
    quantityId: vine
      .string()
      .uuid({ version: [4] })
      .exists({ table: "physical_quantities", column: "id" })
      .transform((value) => value as UUID),
  })
);

export const updateGensetPropertyValidator = vine.compile(
  vine.object({
    propertyName: vine //
      .string()
      .minLength(1)
      .unique({ table: "genset_properties", column: "property_name" })
      .optional(),
    physicalQuantityId: vine //
      .string()
      .uuid({ version: [4] })
      .exists({ table: "physical_quantities", column: "id" })
      .optional()
      .transform((value) => value as UUID),
  })
);
