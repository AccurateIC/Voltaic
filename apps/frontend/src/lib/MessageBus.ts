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
    const handler = (data) => callbackRef.current?.(data);
    const unsubscribe = messageBus.subscribe(channel, handler);
    return () => unsubscribe();
  }, [channel]); // ✅ stable — only re-subscribes if channel changes

  return useCallback((data) => messageBus.publish(channel, data), [channel]);
};
