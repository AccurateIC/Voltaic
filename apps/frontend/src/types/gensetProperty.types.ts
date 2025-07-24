import { PhysicalQuantity } from "./physicalQuantity.types";

export interface GensetProperty {
  id: number;
  propertyName: GensetPropertyName;
  readablePropertyName: string;
  physicalQuantityId: number;
  physicalQuantity: PhysicalQuantity;
}

export type GensetPropertyName =
  | "engTemp"
  | "engOilTemp"
  | "engOilPress"
  | "engFuelLevel"
  | "engChargeAltVolts"
  | "engBatteryVolts"
  | "engSpeedDisplay"
  | "engFuelConsumption"
  | "engFuelLevelUnits"
  | "genL1Current"
  | "genL2Current"
  | "genL3Current"
  | "genL1Volts"
  | "genL2Volts"
  | "genL3Volts"
  | "genTotalVA"
  | "mainsL1Current"
  | "mainsL2Current"
  | "mainsL3Current"
  | "mainsL1Volts"
  | "mainsL2Volts"
  | "mainsL3Volts";
