import { PhysicalQuantity } from "./physicalQuantity.types";

export interface GensetProperty {
  id: number;
  propertyName: string;
  readablePropertyName: string;
  physicalQuantityId: number;
  physicalQuantity: PhysicalQuantity;
}
