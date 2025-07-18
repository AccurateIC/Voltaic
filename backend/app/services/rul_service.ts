
import { getRulPrediction } from "../utils/rul_api.js"; // path to your fetch logic (make sure it's correct!)
import { propertyStatsValidator } from "#validators/archive";

export class RulService {
  static async fetchPrediction({ request }: HttpContext) {
    const data = await request.validateUsing(propertyStatsValidator);
    
    const service = {
      Time_Hours: 210,
      RPM_Deviation_Percentage: 0.067,
      Oil_Pressure: 1.88,
      Power_Output_kW: 0.924,
      Inverse_Fuel_Consumption: 0.825,
    };

    const prediction = await getRulPrediction(service);
    // console.log("prediction", prediction);
    return prediction;
  }
}
