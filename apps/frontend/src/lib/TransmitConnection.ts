// src/lib/TransmitConnection.ts
import { Transmit } from "@adonisjs/transmit-client";
import { BACKEND_BASE_URL } from "../config/backend";

class TransmitConnection {
  private static instance: TransmitConnection;
  private transmit!: Transmit;

  constructor() {
    if (!TransmitConnection.instance) {
      this.transmit = new Transmit({
        baseUrl: BACKEND_BASE_URL,
        uidGenerator: () => {
          if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
          }
          return Math.random().toString(36).substring(2) + Date.now().toString(36);
        },
        maxReconnectAttempts: 5,
        onReconnectAttempt: (attempt: number) => {},
        onReconnectFailed: () =>{} ,
      });

      this.transmit.on("connected", () =>{});
      this.transmit.on("disconnected", () => {});
      this.transmit.on("reconnecting", () => {});

      TransmitConnection.instance = this;
    }
    return TransmitConnection.instance;
  }

  getInstance() {
    return this.transmit;
  }
}

const transmitConnection = new TransmitConnection().getInstance();
export default transmitConnection;
