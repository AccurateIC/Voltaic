import vine from "@vinejs/vine";

/**
 * Validator for user creation.
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(5),
    firstName: vine.string().minLength(2),
    lastName: vine.string().optional(),
    roleId: vine.number(),
    isActive: vine.boolean(),
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

export const updateUserProfileValidator = vine.compile(
  vine.object({
    email: vine.string().email().optional(),
    firstName: vine.string().minLength(2).optional(),
    lastName: vine.string().optional(),
  })
);
