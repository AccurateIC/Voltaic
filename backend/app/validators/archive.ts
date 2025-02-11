import vine from "@vinejs/vine";

export const createArchiveValidator = vine.compile(
  vine.object({
    timestamp: vine.date(),
    propertyValue: vine.number(),
    isAnomaly: vine.boolean(),
    propertyMeasured: vine.boolean(),
  })
);
