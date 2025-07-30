import { getRulPrediction } from "../utils/rul_api.js";

export class RulService {
  static async fetchPrediction() {
    const service = {
      Time_Hours: 210,
      RPM_Deviation_Percentage: 0.067,
      Oil_Pressure: 1.88,
      Power_Output_kW: 0.924,
      Inverse_Fuel_Consumption: 0.825,
    };

    try {
      const prediction = await getRulPrediction(service);
      if (prediction) {
        return prediction;
      } else {
        throw new Error("Empty prediction response");
      }
    } catch (err) {
      console.error("RUL fetch error:", err.message);
      return null; 
    }
  }
}


// import { getRulPrediction } from "../utils/rul_api.js";

// export class RulService {
//   static async fetchPrediction() {
//     const service = {
//       Time_Hours: 210,
//       RPM_Deviation_Percentage: 0.067,
//       Oil_Pressure: 1.88,
//       Power_Output_kW: 0.924,
//       Inverse_Fuel_Consumption: 0.825,
//     };

//     const prediction = await getRulPrediction(service);
//     // console.log("RUL Prediction response:", prediction);
//     return prediction;
//   }
// }

// import { getRulPrediction } from "../utils/rul_api.js"; // path to your fetch logic (make sure it's correct!)
// // import { propertyStatsValidator } from "#validators/archive";
// import type { HttpContext } from "@adonisjs/core/http";
// export class RulService {
//   static async fetchPrediction({ request }: HttpContext) {
//     // const data = await request.validateUsing(propertyStatsValidator);

//     const service = {
//       Time_Hours: 210,
//       RPM_Deviation_Percentage: 0.067,
//       Oil_Pressure: 1.88,
//       Power_Output_kW: 0.924,
//       Inverse_Fuel_Consumption: 0.825,
//     };

//     const prediction = await getRulPrediction(service);
//     return prediction;
//   }
// }
