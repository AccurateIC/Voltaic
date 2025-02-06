import vine from "@vinejs/vine";

export const addValidator = vine.compile(
  vine.object({
    a: vine.number(),
    b: vine.number(),
  })
);
