import vine from "@vinejs/vine";

/**
 * Validator for user creation.
 */
export const createUserValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(2),
    lastName: vine.string().optional(),
    email: vine.string().email(),
    password: vine.string().minLength(5),
    roleId: vine.number(),
  })
);

/**
 * Validator for user login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(5),
  })
);
