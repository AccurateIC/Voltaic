import vine from "@vinejs/vine";
import { UUID } from "node:crypto";

export const createNotificationValidator = vine.compile(
  vine.object({
    summary: vine.string().minLength(1),
    message: vine.string().minLength(1),
    archiveId: vine
      .string()
      .uuid({ version: [4] })
      .exists({ table: "archives", column: "id" })
      .transform((value) => value as UUID),
    shouldBeDisplayed: vine.boolean(),
    notificationTypeId: vine
      .string()
      .uuid({ version: [4] })
      .exists({ table: "notification_types", column: "id" })
      .transform((value) => value as UUID),
    startedAt: vine.date({ formats: ["iso8601"] }),
    finishedAt: vine.date({ formats: ["iso8601"] }).nullable(),
  })
);
