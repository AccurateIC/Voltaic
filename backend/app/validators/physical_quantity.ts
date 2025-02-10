import vine from "@vinejs/vine";

export const createPhysicalQuantityValidator = vine.compile(
  vine.object({
    quantityName: vine.string(),
    unitName: vine.string(),
    unitSymbol: vine.string(),
  })
);
