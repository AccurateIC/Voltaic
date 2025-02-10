import vine from "@vinejs/vine";

export const createPhysicalQuantityValidator = vine.compile(
  vine.object({
    roleName: vine.string(),
  })
);
