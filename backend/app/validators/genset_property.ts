import vine from "@vinejs/vine";

export const createGensetPropertyValidator = vine.compile(
  vine.object({
    propertyName: vine //
      .string()
      .minLength(1)
      .unique({ table: "genset_properties", column: "property_name" }),
    quantityId: vine //
      .number()
      .exists({ table: "physical_quantities", column: "id" }),
  })
);

export const updateGensetPropertyValidator = vine.compile(
  vine.object({
    propertyName: vine //
      .string()
      .minLength(1)
      .unique({ table: "genset_properties", column: "property_name" })
      .optional(),
    quantityId: vine //
      .number()
      .exists({ table: "physical_quantities", column: "id" })
      .optional(),
  })
);
