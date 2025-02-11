import vine from "@vinejs/vine";

export const createPhysicalQuantityValidator = vine.compile(
  vine.object({
    quantityName: vine.string().unique({ table: "physical_quantities", column: "quantity_name" }),
    unitName: vine.string(),
    unitSymbol: vine.string(),
  })
);

export const updatePhysicalQuantityValidator = vine.compile(
  vine.object({
    quantityName: vine //
      .string()
      .unique({ table: "physical_quantities", column: "quantity_name" })
      .optional(),
    unitName: vine //
      .string()
      .optional(),
    unitSymbol: vine //
      .string()
      .optional(),
  })
);
