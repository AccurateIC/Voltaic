// backend/app/validator-rules/timezone.ts

import vine from "@vinejs/vine";
import { FieldContext } from "@vinejs/vine/types";
import { DateTime } from "luxon";

export const timezoneRule = vine.createRule(() => (timezone: string, field: FieldContext) => {
  if (!timezone) field.report("{{ field }} must be defined", "timezone", field);
  const now = DateTime.now().setZone(timezone);
  if (!now.isValid) {
    field.report("The {{ field }} is not a valid timezone.", "timezone", field);
  }
});
