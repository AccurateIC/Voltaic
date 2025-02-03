import vine from "@vinejs/vine";

/**
 * Validator for user creation.
 */
export const createNotificationTypeValidator = vine.compile(
  vine.object({
    type: vine.string(),
  })
);
