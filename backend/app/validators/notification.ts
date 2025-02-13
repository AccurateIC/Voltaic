import vine from "@vinejs/vine";

export const createNotificationValidator = vine.compile(
  vine.object({
    summary: vine.string().minLength(1),
    message: vine.string().minLength(1),
    archiveId: vine.number().exists({ table: "archives", column: "id" }),
    shouldBeDisplayed: vine.boolean(),
    notificationTypeId: vine.number().exists({ table: "notification_types", column: "id" }),
    startedAt: vine.date({ formats: ["iso8601"] }),
    finishedAt: vine.date({ formats: ["iso8601"] }).nullable(),
  })
);
