// /src/lib/MessageBus.js

class MessageBus {
    constructor() {
        this.subscribers = new Map();
    }

    subscribe(channel, callback) {
        if (!channel || typeof callback !== 'function') return () => { };

        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set());
        }

        this.subscribers.get(channel).add(callback);
        console.log(`Subscriber added for channel ${channel} with callback func ${callback}`)
        console.log(`Subscribers: `, this.subscribers);

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
            console.log("Publishing")
            console.log("Channel: ", channel);
            console.log("Data: ", data);
            console.log("Channel Subscribers: ", channelSubscribers);
            channelSubscribers.forEach(callback => callback(data));
        }
    }

    clear() {
        this.subscribers.clear();
    }
}

export const messageBus = new MessageBus();

import { useCallback, useEffect } from "react";

export const useMessageBus = (channel, callback) => {
    useEffect(() => {
        if (callback) return messageBus.subscribe(channel, callback);
    }, [channel, callback]);

    return useCallback((data) => messageBus.publish(channel, data), [channel]);
}