// src/lib/SessionStore.ts

/* Centralized way of manipulating session storage */

type SessionKey =
  | "mlNotified" // used to indicate whether ML modules were notified of login
  | "user"; // logged in user details

export const SessionStore = {
  /* Set a Session Key */
  set<T = any>(key: SessionKey, value: T) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },

  get<T = any>(key: SessionKey): T | null {
    const value = sessionStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      
      return null;
    }
  },

  remove(key: SessionKey) {
    sessionStorage.removeItem(key);
  },

  clear() {
    sessionStorage.clear();
  },
};
