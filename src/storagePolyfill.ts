// Polyfill window.storage with localStorage for persistence outside Claude artifacts
declare global {
  interface Window {
    storage?: {
      get: (key: string, shared?: boolean) => Promise<{ value: string } | null>;
      set: (key: string, value: string, shared?: boolean) => Promise<{ ok: boolean }>;
      delete?: (key: string, shared?: boolean) => Promise<{ ok: boolean }>;
    };
  }
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key: string) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? { value: val } : null;
      } catch (err) {
        console.warn("Storage get error:", err);
        return null;
      }
    },
    async set(key: string, value: string) {
      try {
        localStorage.setItem(key, value);
        return { ok: true };
      } catch (err) {
        console.warn("Storage set error:", err);
        throw err;
      }
    },
    async delete(key: string) {
      try {
        localStorage.removeItem(key);
        return { ok: true };
      } catch (err) {
        console.warn("Storage delete error:", err);
        throw err;
      }
    },
  };
}

export {};
