// src/lib/TransmitConnection.js
import { Transmit } from "@adonisjs/transmit-client";

class TransmitConnection {
  constructor() {
    if (!TransmitConnection.instance) {
      this.transmit = new Transmit({
        baseUrl: import.meta.env.VITE_ADONIS_BACKEND,
        withCredentials: true,
        maxReconnectionAttempts: 5,
        onReconnectAttempt: (attempt) => console.log("Reconnect attempt", attempt),
        onReconnectFailed: () => console.log("Reconnect failed"),
      });

      this.transmit.on("connected", () => console.log("connected"));
      this.transmit.on("disconnected", () => console.log("disconnected"));
      this.transmit.on("reconnecting", () => console.log("reconnecting"));

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
