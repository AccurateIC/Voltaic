import vine from "@vinejs/vine";

export const createNotificationTypeValidator = vine.compile(
  vine.object({
    type: vine.string(),
  })
);
