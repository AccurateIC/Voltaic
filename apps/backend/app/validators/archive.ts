import vine from "@vinejs/vine";
import { timezoneRule } from "#validator-rules/timezone";
import { DateTimeUnit } from "luxon";

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

export const getArchiveDataPropertyBetweenValidator = vine.compile(
  vine.object({
    from: vine.date({ formats: ["iso8601"] }).optional(),
    to: vine
      .date({ formats: ["iso8601"] })
      .afterField("from", { compare: "second" })
      .optional(),
    properties: vine.array(vine.string().exists({ table: "genset_properties", column: "property_name" })).optional(),
  })
);

export const getPaginatedDataValidator = vine.compile(
  vine.object({
    page: vine.number(),
    from: vine.date({ formats: ["iso8601"] }).optional(),
    to: vine.date({ formats: ["iso8601"] }).optional(),
    propertyNames: vine.array(vine.string().exists({ table: "genset_properties", column: "property_name" })).optional(),
    isAnomaly: vine.boolean().optional(),
  })
);

export const getPropertyStatisticsValidator = vine.compile(
  vine.object({
    propertyName: vine.string().exists({ table: "genset_properties", column: "property_name" }),
    timeDuration: vine
      .string()
      .in(["day", "week", "month", "year"]) // subset of DateTimeUnit
      .transform((value) => value as DateTimeUnit),
    headers: vine.object({
      timezone: vine.string().use(timezoneRule()),
    }),
  })
);

export const getAnomalyStatisticsValidator = vine.compile(
  vine.object({
    headers: vine.object({
      timezone: vine.string().use(timezoneRule()),
    }),
  })
);
