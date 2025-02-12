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

// TODO: This does not throw an error when `to` datetime is lesser than `from`.
//       This is not the intended behaviour but it is fine since the filtering works
//       even with incorrect dates and no data is returned when `to` < `from`
export const getArchiveDataBetweenValidator = vine.compile(
  vine.object({
    from: vine.date({ formats: ["iso8601"] }),
    to: vine.date({ formats: ["iso8601"] }).afterField("from", { compare: "second" }),
  })
);
