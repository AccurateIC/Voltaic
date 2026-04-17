// src/hooks/useTransmit.ts
import { Transmit } from "@adonisjs/transmit-client";
import { BACKEND_BASE_URL } from "../config/backend";

let transmitInstance: Transmit | null = null;

export function getTransmit() {
  if (!transmitInstance) {
    transmitInstance = new Transmit({
      baseUrl: BACKEND_BASE_URL,
    });
  }
  return transmitInstance;
}