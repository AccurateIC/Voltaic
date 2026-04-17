// /src/lib/MessageBus.js

class MessageBus {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(channel, callback) {
    if (!channel || typeof callback !== "function") return () => {};

    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }

    this.subscribers.get(channel).add(callback);

    return () => {
      const channelSubscribers = this.subscribers.get(channel);
      if (channelSubscribers) {
        channelSubscribers.delete(callback);
        if (channelSubscribers.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  publish(channel, data) {
    if (!channel || !this.subscribers.has(channel)) return;
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.forEach((callback) => callback(data));
    }
  }

  clear() {
    this.subscribers.clear();
  }
}

export const messageBus = new MessageBus();

import { useCallback, useEffect, useRef } from "react";

export const useMessageBus = (channel, callback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let unsubscribe;
    if (callbackRef.current) {
      const handler = (data) => {
        if (callbackRef.current) callbackRef.current(data);
      };
      unsubscribe = messageBus.subscribe(channel, handler);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [channel]);

  return useCallback((data) => messageBus.publish(channel, data), [channel]);
};
