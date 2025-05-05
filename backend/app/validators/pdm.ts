import vine from "@vinejs/vine";

// const data = {
//   last_values: {
//     accel_x: [1.08984375, 0.72998046875],
//     accel_y: [-0.5576171875, 0.24658203125],
//   },
//   forecasted_values: {
//     accel_x: [2.271426526058037, 1.4600747330822037],
//     accel_y: [-0.2526654336337322, -1.136376176444832],
//   },
//   PDM: {
//     accel_x: false,
//     accel_y: false,
//   },
//   maintenance_needed: false,
//   Time: "12:53:22",
// };

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
