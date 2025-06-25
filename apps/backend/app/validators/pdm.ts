import { timezoneRule } from "#validator-rules/timezone";
import vine from "@vinejs/vine";

export const createPdmValidator = vine.compile(
  vine.object({
    actual_values: vine.object({
      accel_x: vine.array(vine.number()),
      accel_y: vine.array(vine.number()).optional(),
      accel_z: vine.array(vine.number()).optional(),
    }),
    actual_values_timestamp: vine.array(vine.date({ formats: ["iso8601"] })),
    forecasted_values: vine.object({
      accel_x: vine.array(vine.number()),
      accel_y: vine.array(vine.number()).optional(),
      accel_z: vine.array(vine.number()).optional(),
    }),
    forecasted_values_timestamp: vine.array(vine.date({ formats: ["iso8601"] })),
    PDM: vine.object({
      accel_x: vine.boolean(),
      accel_y: vine.boolean().optional(),
      accel_z: vine.boolean().optional(),
    }),
    confidence_score_percentage: vine.number().min(0).max(100).nullable(),
    predicted_dominant_frequency: vine.number(), // normal freq: 0.1
    predicted_dominant_amplitude: vine.number(), // normal amplitude: [-2, +2]
    maintenance_needed: vine.boolean(),
    maintenance_reason: vine
      .object({
        accel_x: vine.string().optional(),
        accel_y: vine.string().optional(),
        accel_z: vine.string().optional(),
      })
      .optional(),
  })
);

const DateTimeUnits = ["year", "quarter", "month", "week", "day", "hour", "minute", "second", "millisecond"];

export const getPdmStatisticsValidator = vine.compile(
  vine.object({
    timeDuration: vine.string().in(DateTimeUnits),
    headers: vine.object({
      timezone: vine.string().use(timezoneRule()),
    }),
  })
);
