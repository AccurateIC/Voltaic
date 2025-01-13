// src/lib/WebSocketConnection.js

import { useCallback, useEffect, useState } from "react";

const EVENTS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  MESSAGE: "message",
  ERROR: "error",
};

const webSocketUrl = import.meta.env.VITE_DATA_WEBSOCKET_SERVER_URL;
console.log(webSocketUrl);
const listeners = new Map();
const messageQueue = [];
let socket = null;
let isConnecting = false;
let reconnectAttempts = 0;
let reconnectTimeout = null;

const addListener = (event, callback) => {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(callback);
};

const removeListener = (event, callback) => {
  const eventListeners = listeners.get(event);
  if (eventListeners) {
    eventListeners.delete(callback);
    if (eventListeners.size === 0) {
      listeners.delete(event);
    }
  }
};

const emitEvent = (event, data) => {
  const eventListeners = listeners.get(event);
  if (eventListeners) {
    eventListeners.forEach((callback) => callback(data));
  }
};

const connect = () => {
  if (isConnecting || socket?.readyState === WebSocket.OPEN) return;

  isConnecting = true;
  socket = new WebSocket(webSocketUrl);

  socket.onopen = (ev) => {
    isConnecting = false;
    reconnectAttempts = 0;
    emitEvent(EVENTS.CONNECTED);

    // process any queued messages
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      sendMessage(message);
    }
  };

  socket.onclose = (ev) => {
    isConnecting = false;
    emitEvent(EVENTS.DISCONNECTED);
  };

  socket.onerror = (ev) => {
    console.error(ev)
    isConnecting = false;

    emitEvent(EVENTS.ERROR);
  };

  socket.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      emitEvent(EVENTS.MESSAGE, data);
    } catch (err) {
      console.error(EVENTS.ERROR, err)
      // emitEvent(EVENTS.MESSAGE, ev.data); // send string if json parsing failed?
    }
  };
};

const attemptReconnect = () => {
  if (reconnectAttempts > 5) return;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
  reconnectTimeout = setTimeout(connect, delay);
};

const disconnect = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};

const sendMessage = (message) => {
  const stringifiedMessage =
    typeof message === "string" ? message : JSON.stringify(message);

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
  } else {
    messageQueue.push(stringifiedMessage);
    connect();
  }
};

// React Hook
export const useWebSocket = (onMessage) => {
  const [isConnected, setIsConnected] = useState(
    socket?.readyState === WebSocket.OPEN,
  );

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    addListener(EVENTS.CONNECTED, handleConnect);
    addListener(EVENTS.DISCONNECTED, handleDisconnect);
    if (onMessage) {
      addListener(EVENTS.MESSAGE, onMessage);
    }

    connect();

    return () => {
      removeListener(EVENTS.CONNECTED, handleConnect);
      removeListener(EVENTS.DISCONNECTED, handleDisconnect);
      if (onMessage) {
        removeListener(EVENTS.MESSAGE, onMessage);
      }
    };
  }, [onMessage]);

  const send = useCallback((message) => {
    sendMessage(message);
  }, []);

  return {
    send,
    isConnected,
  };
};
