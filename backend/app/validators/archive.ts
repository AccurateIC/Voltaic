import vine from "@vinejs/vine";

const archiveRowSchema = vine.object({
  property: vine //
    .string()
    .exists({ table: "genset_properties", column: "property_name" }),
  value: vine.number(),
  is_anomaly: vine.boolean(),
});

const archiveSchema = vine.object({
  timestamp: vine.date({ formats: ["iso8601"] }),
  data: vine.array(archiveRowSchema).minLength(1),
});

export const createArchiveValidator = vine.compile(archiveSchema);
