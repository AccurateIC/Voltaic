// src/features/RUL/types/rul.types.ts

export interface RulPrediction {
  Predicted_Health_Index?: number;
  Remaining_Useful_Life?: number;
  User?: string;
  Time_Hours?: number;
}

export interface RulInputData {
  Time_Hours: number;
  RPM_Deviation_Percentage: number;
  Oil_Pressure: number;
  Power_Output_kW: number;
  Inverse_Fuel_Consumption: number;
}
